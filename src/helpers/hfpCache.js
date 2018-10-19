import localforage from "localforage";
import get from "lodash/get";
import compact from "lodash/compact";

export function createFetchKey(route, date, time, allowPartial = false) {
  const keyParts = [date, createRouteKey(route), time];

  if (!allowPartial && keyParts.some((p) => !p)) {
    return "";
  }

  return compact(keyParts).join(".");
}

export function createRouteKey(route) {
  const keyParts = [
    get(route, "routeId", ""),
    get(route, "direction", ""),
    get(route, "dateBegin", ""),
    get(route, "dateEnd", ""),
  ];

  if (keyParts.some((part) => !part)) {
    return "";
  }

  // Join into string and ensure no dots
  return keyParts.join("_").replace(".", "-");
}

export async function cacheData(hfpData) {
  if (!hfpData || hfpData.length === 0) {
    return [];
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
  }

  return hfpData;
}

export async function getCachedData(journeyIds) {
  const journeyIdsArray = Array.isArray(journeyIds) ? journeyIds : [journeyIds];

  let cachedHfp = [];

  for (const journeyId of journeyIdsArray) {
    let positions = [];

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
