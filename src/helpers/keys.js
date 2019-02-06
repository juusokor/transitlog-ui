import get from "lodash/get";
import compact from "lodash/compact";

export function createRouteKey(route, allowPartial = false) {
  const keyParts = compact([
    get(route, "routeId", ""),
    get(route, "direction", ""),
    get(route, "dateBegin", ""),
    get(route, "dateEnd", ""),
  ]);

  if (!allowPartial && keyParts.length !== 4) {
    return "";
  }

  // Join into string and ensure no dots
  return keyParts.join("_").replace(".", "-");
}

// Supports both JORE routes as well as HFP journeys.
export function createRouteId(route) {
  const keyParts = [
    get(route, "routeId", get(route, "route_id", "")),
    get(route, "direction", get(route, "direction_id", "")),
  ];

  return compact(keyParts).join("_");
}
