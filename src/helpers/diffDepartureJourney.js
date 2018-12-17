import get from "lodash/get";
import moment from "moment-timezone";
import {combineDateAndTime} from "./time";
import doubleDigit from "./doubleDigit";

export function diffDepartureJourney(journey, departure, date, useArrival = false) {
  const receivedAt = get(journey, "received_at", null);

  if (!receivedAt) {
    return null;
  }

  const observedDepartureTime = moment.tz(receivedAt, "Europe/Helsinki");

  const hourProp = useArrival ? "arrivalHours" : "hours";
  const minuteProp = useArrival ? "arrivalMinutes" : "minutes";

  // The stopDeparture uses a 30-hour day, so the night hours actually belong
  // to the previous day and not the current day.
  const adjustedDate =
    (departure[hourProp] === 4 && departure[minuteProp] < 30) ||
    departure[hourProp] < 4
      ? moment
          .tz(date, "Europe/Helsinki")
          .add(1, "day")
          .format("YYYY-MM-DD")
      : date;

  const plannedDepartureTime = combineDateAndTime(
    adjustedDate,
    `${doubleDigit(departure[hourProp])}:${doubleDigit(departure[minuteProp])}`,
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
