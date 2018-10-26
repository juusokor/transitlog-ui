import get from "lodash/get";
import moment from "moment-timezone";
import {combineDateAndTime} from "./time";
import doubleDigit from "./doubleDigit";

export function diffDepartureJourney(journey, departure, date) {
  const received_at = get(journey, "received_at", null);

  if (!received_at) {
    return null;
  }

  const observedDepartureTime = moment.tz(received_at, "Europe/Helsinki");

  // The departure uses a 30-hour day, so the night hours actually belong
  // to the previous day and not the current day.
  const adjustedDate =
    (departure.hours === 4 && departure.minutes < 30) || departure.hours < 4
      ? moment
          .tz(date, "Europe/Helsinki")
          .add(1, "day")
          .format("YYYY-MM-DD")
      : date;

  const plannedDepartureTime = combineDateAndTime(
    adjustedDate,
    `${doubleDigit(departure.hours)}:${doubleDigit(departure.minutes)}`,
    "Europe/Helsinki"
  );

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
