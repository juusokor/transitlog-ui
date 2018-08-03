import * as JSONC from "./JSONC";

export function getCacheKey(date, route) {
  const {routeId, direction} = route;
  return `${date}.${routeId}.${direction}`;
}

export function cacheData(hfpData, date, route) {
  if (!hfpData || hfpData.length === 0) {
    return;
  }

  const key = getCacheKey(date, route);

  if (window.localStorage.getItem(key)) {
    window.localStorage.removeItem(key);
  }

  const data = JSONC.pack(hfpData, true); // Compress json

  try {
    window.localStorage.setItem(key, data);
  } catch (e) {
    window.localStorage.clear();
    window.localStorage.setItem(key, data);
  }
}

export function getCachedData(date, route) {
  const key = getCacheKey(date, route);
  const stored = window.localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  return JSONC.unpack(stored, true);
}
