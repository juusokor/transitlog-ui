import get from "lodash/get";
import moment from "moment-timezone";
import {combineDateAndTime} from "./time";
import doubleDigit from "./doubleDigit";
import {getAdjustedDepartureDate} from "./getAdjustedDepartureDate";

export function diffDepartureJourney(journey, departure, date) {
  const receivedAt = get(journey, "received_at", null);

  if (!receivedAt) {
    return null;
  }

  const observedDepartureTime = moment.tz(receivedAt, "Europe/Helsinki");
  const plannedDepartureTime = getAdjustedDepartureDate(departure, date);

  const diff = plannedDepartureTime.diff(observedDepartureTime, "seconds");

  const sign = diff < 0 ? "+" : diff > 0 ? "-" : "";
  const seconds = Math.abs(diff) % 60;
  const minutes = Math.floor(Math.abs(diff) / 60);

  return {
    diff,
    minutes,
    seconds,
    sign,
    observedMoment: observedDepartureTime,
    plannedMoment: plannedDepartureTime,
  };
}
