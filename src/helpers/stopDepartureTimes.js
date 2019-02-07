import {diffDepartureJourney} from "./diffDepartureJourney";
import getDelayType from "./getDelayType";
import {getTimelinessColor} from "./timelinessColor";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";
import get from "lodash/get";

/*
  TODO: Use this in all places where calculations like this need to be made.
 */

export const stopDepartureTimes = (positions = [], journeyDeparture, date) => {
  const departureEvent = positions[0];

  if (!journeyDeparture || !departureEvent || !date) {
    return false;
  }

  const departureDiff = diffDepartureJourney(departureEvent, journeyDeparture, date);
  const departureDelayType = getDelayType(get(departureDiff, "diff", false));
  const departureColor = getTimelinessColor(departureDelayType, "#000");

  let plannedDepartureMoment = get(departureDiff, "plannedMoment", null);

  if (!plannedDepartureMoment) {
    plannedDepartureMoment = getAdjustedDepartureDate(journeyDeparture, date);
  }

  return {
    departure: journeyDeparture,
    departureEvent,
    delayType: departureDelayType,
    color: departureColor,
    departureDiff,
    departureMoment: get(departureDiff, "observedMoment", null),
    plannedDepartureMoment,
  };
};
