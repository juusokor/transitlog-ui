import pick from "lodash/pick";

export function getJourneyObject(journeyItem) {
  if (!journeyItem) {
    return {};
  }

  return pickPropsFromJourney(journeyItem);
}

function pickPropsFromJourney(journey) {
  return pick(
    {uniqueVehicleId: "", ...journey},
    "departureDate",
    "departureTime",
    "direction",
    "routeId",
    "uniqueVehicleId"
  );
}
