import {fetchHfpJourney, loadCache, persistCache} from "../helpers/hfpQueryManager";

export async function getHfp(route, date, time, skipCache) {
  const result = await fetchHfpJourney(JSON.parse(route), date, time, skipCache);
  return JSON.stringify(result);
}

export async function hydrateCache() {
  return loadCache();
}

export function saveCache() {
  return persistCache();
}
