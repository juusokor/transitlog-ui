import get from "lodash/get";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";

export const stopArrivalTimes = (positions = [], departure, date) => {
  const event = positions[0];

  if (!event || !departure || !date) {
    return false;
  }

  // Find out when the vehicle arrived at the stop
  // by looking at when the doors were opened.
  let doorDidOpen = false;
  let arrivalEvent = event;

  if (event) {
    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];

      if (doorDidOpen && !position.drst) {
        arrivalEvent = positions[i - 1];

        // If that didn't exist, just pick the current item as a fallback.
        if (!arrivalEvent) {
          arrivalEvent = positions[i];
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

  if (arrivalTime) {
    arrivalMoment = moment.tz(arrivalTime, TIMEZONE);
  }

  return {
    arrivalEvent,
    arrivalMoment,
    plannedArrivalMoment: getAdjustedDepartureDate(departure, date, true),
  };
};
