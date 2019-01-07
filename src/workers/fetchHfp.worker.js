import * as hfpManager from "../helpers/hfpQueryManager";

export async function fetchHfpJourney(route, date, time, skipCache) {
  return hfpManager.fetchHfpJourney(route, date, time, skipCache);
}
