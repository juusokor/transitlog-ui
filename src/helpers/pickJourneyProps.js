import pick from "lodash/pick";

export function pickJourneyProps(hfp) {
  return pick(hfp, "oday", "journeyStartTime", "directionId", "routeId");
}
