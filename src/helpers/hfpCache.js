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

  try {
    if (await localforage.getItem(key)) {
      await localforage.removeItem(key);
    }

    await localforage.setItem(key, hfpData);
  } catch (e) {
    console.log(e);
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

  return stored;
}
