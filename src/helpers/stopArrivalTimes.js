import get from "lodash/get";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";
import {diffDepartureJourney} from "./diffDepartureJourney";
import getDelayType from "./getDelayType";
import {getTimelinessColor} from "./timelinessColor";

/**
 *
 * @param stopPositions positions with next_stop_id = [current stop]
 * @param stopDeparture the planned departure from [current stop]
 * @param date selected date in YYYY-MM-DD format
 * @returns {*}
 */
export const stopArrivalTimes = (stopPositions = [], stopDeparture, date) => {
  let arrivalEvent = stopPositions[0];

  if (!arrivalEvent || !stopDeparture || !date) {
    return false;
  }

  // Find out when the vehicle arrived at the stop
  // by looking at when the doors were opened.
  let doorDidOpen = false;

  if (arrivalEvent) {
    for (let i = 0; i < stopPositions.length; i++) {
      const position = stopPositions[i];

      if (doorDidOpen && !position.drst) {
        arrivalEvent = stopPositions[i - 1];

        // If that didn't exist, just pick the current item as a fallback.
        if (!arrivalEvent) {
          arrivalEvent = stopPositions[i];
        }
        break;
      }

      if (!doorDidOpen && !!position.drst) {
        doorDidOpen = true;
      }
    }
  }

  const arrivalTime = get(arrivalEvent, "received_at", null);
  let arrivalMoment = null;
  let arrivalDelayType = null;
  let arrivalColor = null;
  let arrivalDiff = null;

  if (arrivalTime) {
    arrivalMoment = moment.tz(arrivalTime, TIMEZONE);
    arrivalDiff = diffDepartureJourney(arrivalEvent, stopDeparture, date);
    arrivalDelayType = getDelayType(get(arrivalDiff, "diff", false));
    arrivalColor = getTimelinessColor(arrivalDelayType, "var(--dark-grey)");
  }

  return {
    arrivalEvent,
    arrivalDelayType,
    arrivalColor,
    arrivalDiff,
    arrivalMoment,
    plannedArrivalMoment: getAdjustedDepartureDate(stopDeparture, date, true),
  };
};
