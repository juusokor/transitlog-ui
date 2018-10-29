import get from "lodash/get";
import compact from "lodash/compact";

export function createFetchKey(route, date, time, allowPartial = false) {
  const keyParts = [date, createRouteKey(route), time];

  if (!allowPartial && keyParts.some((p) => !p)) {
    return "";
  }

  return compact(keyParts).join(".");
}

export function createRouteKey(route, allowPartial = false) {
  const keyParts = [
    get(route, "routeId", ""),
    get(route, "direction", ""),
    get(route, "dateBegin", ""),
    get(route, "dateEnd", ""),
  ];

  if (!allowPartial && keyParts.some((part) => !part)) {
    return "";
  }

  // Join into string and ensure no dots
  return keyParts.join("_").replace(".", "-");
}
