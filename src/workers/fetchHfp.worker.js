import {fetchHfpJourney as _fetchHfpJourney} from "../helpers/hfpQueryManager";

export async function fetchHfpJourney(route, date, time, skipCache) {
  const result = await _fetchHfpJourney(JSON.parse(route), date, time, skipCache);
  return JSON.stringify(result);
}
