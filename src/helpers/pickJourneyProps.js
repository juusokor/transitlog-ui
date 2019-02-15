import pick from "lodash/pick";

export function pickJourneyProps(hfp) {
  return pick(
    {instance: 0, unique_vehicle_id: "unknown-vehicle", ...hfp},
    "oday",
    "journey_start_time",
    "direction_id",
    "route_id",
    "instance",
    "unique_vehicle_id"
  );
}
