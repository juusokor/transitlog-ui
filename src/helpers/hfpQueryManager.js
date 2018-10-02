import {getCachedData, cacheData, getCacheKey} from "../helpers/hfpCache";
import get from "lodash/get";
import set from "lodash/set";
import {queryHfp} from "../queries/HfpQuery";
import getJourneyId from "../helpers/getJourneyId";
import {groupHfpPositions} from "../helpers/groupHfpPositions";

let cachingInProgress = {};

export async function fetchHfp(route, date, time) {
  const cacheKey = getCacheKey(route, date);

  // If cachekey is false then we don't have a route selection yet
  if (!cacheKey) {
    return [];
  }

  // If we have cached data for this cache key, that's it, we're done.
  const cachedData = await getCachedData(cacheKey);
  if (cachedData && cachedData.length !== 0) {
    return cachedData;
  }

  // All fetching and caching promises are recorded in the cachingInProgress object.
  // Look for a fetch-in-progress by the cache key.
  let cachingPromise = get(cachingInProgress, cacheKey, null);

  if (!cachingPromise) {
    // Start a new fetch if one isn't already in progress
    cachingPromise = queryHfp(route, date, time)
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
    set(cachingInProgress, cacheKey, cachingPromise);
  }

  // Await the caching promise we got
  const cachedResult = await cachingPromise;
  // When done, clear the promise so that future fetches may take place.
  set(cachingInProgress, cacheKey, null);

  return cachedResult;
}
