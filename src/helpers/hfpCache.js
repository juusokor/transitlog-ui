import localforage from "localforage";

export function getCacheKey(date, route) {
  return `${date}.${route}`;
}

export async function cacheData(hfpData, date, route) {
  if (!hfpData || hfpData.length === 0) {
    return;
  }

  console.time("Cache HFP");

  const key = getCacheKey(date, route);

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

  console.timeEnd("Cache HFP");
}

export async function getCachedData(date, route) {
  const key = getCacheKey(date, route);
  const stored = await localforage.getItem(key);

  if (!stored) {
    return [];
  }

  return stored;
}
