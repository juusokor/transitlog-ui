import localforage from "localforage";
import get from "lodash/get";

export function getCacheKey(route, date) {
  if (
    !get(route, "routeId", "") ||
    !get(route, "direction", "") ||
    !get(route, "dateBegin", "")
  ) {
    return false;
  }

  return `${date}.${route.routeId}.${route.direction}.${route.dateBegin}.${
    route.dateEnd
  }`;
}

export async function cacheData(hfpData, route, date) {
  if (!hfpData || hfpData.length === 0) {
    return;
  }

  const key = getCacheKey(route, date);

  if (!key) {
    return;
  }

  let cachedJourneys = null;
  let hasCachedDataForKey = false;

  try {
    cachedJourneys = await localforage.getItem(key);
    hasCachedDataForKey = true;
  } catch (err) {
    cachedJourneys = null;
    hasCachedDataForKey = false;
  }

  if (!cachedJourneys) {
    cachedJourneys = [];
  }

  for (const hfpItem of hfpData) {
    const {journeyId, positions} = hfpItem;

    let cachedData = null;

    try {
      cachedData = await localforage.getItem(journeyId);
    } catch (err) {
      cachedData = null;
    }

    try {
      if (cachedData) {
        await localforage.removeItem(journeyId);
      }
      await localforage.setItem(journeyId, positions);
    } catch (err) {
      console.error(`Caching journey ${journeyId} failed.`, err);
    }

    if (!cachedJourneys.includes(journeyId)) {
      cachedJourneys.push(journeyId);
    }
  }

  try {
    if (hasCachedDataForKey) {
      await localforage.removeItem(key);
    }
    await await localforage.setItem(key, cachedJourneys);
  } catch (err) {
    console.log(err);
  }

  return hfpData;
}

export async function getCachedData(key) {
  let stored = null;

  try {
    stored = await localforage.getItem(key);
  } catch (err) {
    console.log(err);
  }

  if (!stored) {
    return [];
  }

  let cachedHfp = [];

  for (const journeyId of stored) {
    let positions = null;

    try {
      positions = await localforage.getItem(journeyId);
    } catch (err) {
      positions = null;
      console.error(`Cached journey ${journeyId} not found.`, err);
    }

    if (positions && positions.length !== 0) {
      cachedHfp.push({journeyId, positions});
    }
  }

  return cachedHfp;
}
