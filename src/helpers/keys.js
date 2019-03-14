import get from "lodash/get";
import compact from "lodash/compact";

export function createRouteKey(route) {
  return get(route, "id", "");
}

// Supports both JORE routes as well as HFP journeys.
export function createRouteId(route) {
  const keyParts = [
    get(route, "routeId", get(route, "route_id", "")),
    get(route, "direction", get(route, "direction_id", "")),
  ];

  return compact(keyParts).join("_");
}
