import {getCachedData, cacheData, createFetchKey} from "../helpers/hfpCache";
import pick from "lodash/pick";
import get from "lodash/get";
import set from "lodash/set";
import flatten from "lodash/flatten";
import uniqBy from "lodash/uniqBy";
import orderBy from "lodash/orderBy";
import compact from "lodash/compact";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import * as localforage from "localforage";
import subMinutes from "date-fns/sub_minutes";
import addMinutes from "date-fns/add_minutes";
import setSeconds from "date-fns/set_seconds";
import isWithinRange from "date-fns/is_within_range";
import {roundTime} from "./roundTime";

let promiseCache = {};

const queryRange = 15;

export function getTimeRange(date, time) {
  const queryDateTime = setSeconds(new Date(`${date}T${time}`), 0);
  let min = subMinutes(queryDateTime, queryRange / 2);
  let max = addMinutes(queryDateTime, queryRange / 2);

  min = roundTime(min, true);
  max = roundTime(max);

  return {max, min};
}

export async function getCachedJourneyIds(route, date, timeRange) {
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

function getCachePromisesForDate(route, date) {
  const cacheSlice = get(promiseCache, createFetchKey(route, date, false, true), {});
  const promiseKeys = Object.keys(cacheSlice);

  if (promiseKeys.length === 0) {
    return [];
  }

  const pickedPromises = [];

  for (const promiseKey of promiseKeys) {
    pickedPromises.push(get(cacheSlice, promiseKey));
  }

  return compact(pickedPromises);
}

export async function fetchHfp(route, date, time) {
  const timeRange = getTimeRange(date, time);
  const fetchKey = createFetchKey(route, date, timeRange);

  // If fetchKey is false then we don't have all required data yet
  if (!fetchKey) {
    return [];
  }

  // All fetching and caching promises are recorded in the cachingInProgress object.
  // Look for a fetch-in-progress by the cache key.
  let cachingPromise = get(promiseCache, fetchKey);

  if (!cachingPromise) {
    // Start a new fetch if one isn't already in progress
    const cachingPromise = getCachedJourneyIds(route, date, timeRange).then(
      (cachedJourneyIds) => {
        if (cachedJourneyIds.length !== 0) {
          return getCachedData(cachedJourneyIds);
        }

        return (
          queryHfp(route, date, timeRange) // Format the data...
            .then((result) =>
              result.filter((pos) => !!pos && !!pos.lat && !!pos.long)
            )
            // ...group the data by journey
            .then((formattedData) =>
              groupHfpPositions(formattedData, getJourneyId, "journeyId")
            )
            // ...and cache the data.
            .then((journeyGroups) => cacheData(journeyGroups, route, date))
        );
      }
    );

    // Without awaiting it, set the pending promise in the cachingInProgress object
    // so that other instances of this component can await it.
    set(promiseCache, fetchKey, cachingPromise);
  }

  // Await the caching promise we got, as well as all the other ones for this date.
  const cachePromisesForDate = getCachePromisesForDate(route, date);
  const allItemsForDate = await Promise.all(cachePromisesForDate);

  if (allItemsForDate.length === 0) {
    return [];
  }

  return orderBy(uniqBy(flatten(allItemsForDate), "journeyId"), ({journeyId}) => {
    const keyParts = journeyId.slice(8).split("_");
    return keyParts[1];
  });
}
