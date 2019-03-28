import pick from "lodash/pick";

export function getJourneyObject(journeyItem) {
  if (!journeyItem) {
    return {};
  }

  return pickPropsFromJourney(journeyItem);
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
