import pick from "lodash/pick";

export function pickJourneyProps(hfp) {
  return pick(hfp, "oday", "journey_startTime", "direction_id", "route_id");
}
