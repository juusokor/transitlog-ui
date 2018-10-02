import {
  getCachedData,
  cacheData,
  canFetchHfp,
  createFetchKey,
} from "../helpers/hfpCache";
import get from "lodash/get";
import set from "lodash/set";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import * as localforage from "localforage";
import subMinutes from "date-fns/sub_minutes";
import addMinutes from "date-fns/add_minutes";
import setSeconds from "date-fns/set_seconds";
import isWithinRange from "date-fns/is_within_range";

let cachingInProgress = {};

export function getTimeRange(date, time, marginMinutes = 5) {
  const margin = Math.min(Math.max(5, marginMinutes), 60);

  const queryDateTime = setSeconds(new Date(`${date}T${time}`), 0);
  const min = subMinutes(queryDateTime, margin);
  const max = addMinutes(queryDateTime, margin);

  return {max, min};
}

export async function getCachedJourneyIds(route, date, timeRange) {
  const canFetch = canFetchHfp(route, date);

  if (!canFetch) {
    return false;
  }

  let cachedKeys = null;

  try {
    cachedKeys = await localforage.keys();
  } catch (err) {
    cachedKeys = null;
  }

  if (!cachedKeys || cachedKeys.length === 0) {
    return [];
  }

  const cachedJourneyIds = cachedKeys.filter((key) => {
    if (!key.startsWith("journey")) {
      return false;
    }

    const keyParts = key.slice(8).split("_");

    return (
      keyParts[0] === date &&
      keyParts[2] === route.routeId &&
      keyParts[3] === route.direction
    );
  });

  if (cachedJourneyIds.length === 0) {
    return [];
  }

  const {max, min} = timeRange;

  return cachedJourneyIds.reduce((matchingJourneys, cachedId) => {
    const idTime = cachedId.slice(8).split("_")[1];

    const cachedTimeDate = new Date(`${date}T${idTime}`);

    if (isWithinRange(cachedTimeDate, min, max)) {
      matchingJourneys.push(cachedId);
    }

    return matchingJourneys;
  }, []);
}

export async function fetchHfp(route, date, time, marginMinutes) {
  const canFetch = canFetchHfp(route, date);

  // If cacheKey is false then we don't have a route selection yet
  if (!canFetch) {
    return [];
  }

  const timeRange = getTimeRange(date, time, marginMinutes);
  const cachedJourneyIds = await getCachedJourneyIds(route, date, timeRange);

  // If we have cached data for this cache key, that's it, we're done.
  if (cachedJourneyIds.length !== 0) {
    const cachedData = await getCachedData(cachedJourneyIds);
    return cachedData;
  }

  const fetchKey = createFetchKey(route, date, timeRange);

  // All fetching and caching promises are recorded in the cachingInProgress object.
  // Look for a fetch-in-progress by the cache key.
  let cachingPromise = get(cachingInProgress, fetchKey, null);

  if (!cachingPromise) {
    // Start a new fetch if one isn't already in progress
    cachingPromise = queryHfp(route, date, timeRange)
      // Format the data...
      .then((result) => result.filter((pos) => !!pos && !!pos.lat && !!pos.long))
      // ...group the data by journey
      .then((formattedData) =>
        groupHfpPositions(formattedData, getJourneyId, "journeyId")
      )
      // ...and cache the data.
      .then((journeyGroups) => cacheData(journeyGroups, route, date));

    // Without awaiting it, set the pending promise in the cachingInProgress object
    // so that other instances of this component can await it.
    set(cachingInProgress, fetchKey, cachingPromise);
  }

  // Await the caching promise we got
  const cachedResult = await cachingPromise;
  // When done, clear the promise so that future fetches may take place.
  set(cachingInProgress, fetchKey, null);

  return cachedResult;
}
