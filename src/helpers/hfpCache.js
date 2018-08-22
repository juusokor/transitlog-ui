import localforage from "localforage";

export function getCacheKey(date, route) {
  if (!route.routeId || !route.dateBegin) {
    return false;
  }

  return `${date}.${route.routeId}.${route.direction}.${route.dateBegin}.${
    route.dateEnd
  }`;
}

export async function cacheData(hfpData, date, route) {
  if (!hfpData || hfpData.length === 0) {
    return;
  }

  const key = getCacheKey(date, route);

  if (!key) {
    return;
  }

  if (await localforage.getItem(key)) {
    await localforage.removeItem(key);
  }

  try {
    await localforage.setItem(key, hfpData);
  } catch (e) {
    // Take a blind guess that the error happened because
    // the storage quota was reached. Clear and try again.
    await localforage.clear();
    await localforage.setItem(key, hfpData);
  }
}

export async function getCachedData(date, route) {
  const key = getCacheKey(date, route);
  const stored = await localforage.getItem(key);

  if (!stored) {
    return [];
  }

  return stored;
}
