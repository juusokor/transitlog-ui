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

export async function cacheData(dataToCache, cacheKey) {
  if (!dataToCache || dataToCache.length === 0) {
    return [];
  }

  let cachedData = null;

  try {
    cachedData = await localforage.getItem(cacheKey);
  } catch (err) {
    cachedData = null;
  }

  try {
    if (cachedData) {
      await localforage.removeItem(cacheKey);
    }
    await localforage.setItem(cacheKey, dataToCache);
  } catch (err) {
    console.error(`Caching journey ${cacheKey} failed.`, err);
  }

  return dataToCache;
}
