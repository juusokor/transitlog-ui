import {diffDepartureJourney} from "./diffDepartureJourney";
import getDelayType from "./getDelayType";
import {getTimelinessColor} from "./timelinessColor";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";
import get from "lodash/get";

/**
 *
 * @param stopPositions positions with next_stop_id = [current stop]
 * @param stopDeparture the planned departure from [current stop]
 * @param date selected date in YYYY-MM-DD format
 * @returns {*}
 */
export const stopDepartureTimes = (stopPositions = [], stopDeparture, date) => {
  const departureEvent = stopPositions[0];

  if (!stopDeparture || !departureEvent || !date) {
    return false;
  }

  const departureDiff = diffDepartureJourney(departureEvent, stopDeparture, date);
  const departureDelayType = getDelayType(get(departureDiff, "diff", false));
  const departureColor = getTimelinessColor(departureDelayType, "#000");

  let plannedDepartureMoment = get(departureDiff, "plannedMoment", null);

  if (!plannedDepartureMoment) {
    plannedDepartureMoment = getAdjustedDepartureDate(stopDeparture, date);
  }

  return {
    departure: stopDeparture,
    departureEvent,
    delayType: departureDelayType,
    color: departureColor,
    departureDiff,
    departureMoment: get(departureDiff, "observedMoment", null),
    plannedDepartureMoment,
  };
};
