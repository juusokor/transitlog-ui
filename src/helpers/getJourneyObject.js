import pick from "lodash/pick";
import mapKeys from "lodash/mapKeys";

const renameKeys = {
  oday: "departureDate",
  journey_start_time: "departureTime",
  direction_id: "direction",
  route_id: "routeId",
  unique_vehicle_id: "uniqueVehicleId",
};

export function getJourneyObject(journeyItem) {
  let journey = {};

  if (!journeyItem) {
    return journey;
  }

  if (typeof journeyItem.oday === "string") {
    const hfpJourney = pickPropsFromEvent(journeyItem);

    journey = mapKeys(hfpJourney, (value, key) =>
      key in renameKeys ? renameKeys[key] : key
    );
  }

  if (
    typeof journeyItem.departureDate === "string" &&
    typeof journeyItem.routeId === "string"
  ) {
    journey = pickPropsFromJourney(journeyItem);
  }

  return journey;
}

function pickPropsFromJourney(journey) {
  return pick(
    {uniqueVehicleId: "unknown-vehicle", ...journey},
    "departureDate",
    "departureTime",
    "direction",
    "routeId",
    "uniqueVehicleId"
  );
}

function pickPropsFromEvent(event) {
  return pick(
    {unique_vehicle_id: "unknown-vehicle", ...event},
    "oday",
    "journey_start_time",
    "direction_id",
    "route_id",
    "unique_vehicle_id"
  );
}
