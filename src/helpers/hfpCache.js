import localforage from "localforage";
import get from "lodash/get";
import format from "date-fns/format";
import isValid from "date-fns/is_valid";

export function createFetchKey(route, date, timeRange) {
  const keyParts = [
    route.routeId,
    route.direction,
    route.dateBegin,
    route.dateEnd,
    date,
    isValid(timeRange.min) ? format(timeRange.min, "HH:mm") : "",
    isValid(timeRange.max) ? format(timeRange.max, "HH:mm") : "",
  ];

  if (keyParts.some((p) => !p)) {
    return "";
  }

  return keyParts.join("_");
}

export function canFetchHfp(route, date) {
  if (
    !get(route, "routeId", "") ||
    !get(route, "direction", "") ||
    !get(route, "dateBegin", "") ||
    !date
  ) {
    return false;
  }

  return true;
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
