import moment from "moment-timezone";
import {combineDateAndTime} from "./time";
import doubleDigit from "./doubleDigit";
import get from "lodash/get";

export const getAdjustedDate = (hours, minutes, date) => {
  const adjustedDate =
    (hours === 4 && minutes < 30) || hours < 4
      ? moment
          .tz(date, "Europe/Helsinki")
          .add(1, "day")
          .format("YYYY-MM-DD")
      : date;

  return adjustedDate;
};

export const getAdjustedEventDate = (event) => {
  const eventMoment = moment.tz(get(event, "receivedAt"), "Europe/Helsinki");
  const hours = eventMoment.hour();
  const minutes = eventMoment.minute();

  return getAdjustedDate(hours, minutes, get(event, "oday"));
};

/**
 * Creates a moment from a departure time with 30-hour day adjustments applied.
 *
 * @param departure
 * @param date
 * @returns Moment
 */
export const getAdjustedDepartureDate = (departure, date, useArrival = false) => {
  const hours = useArrival ? departure.arrivalHours : departure.hours;
  const minutes = useArrival ? departure.arrivalMinutes : departure.minutes;

  const adjustedDate = getAdjustedDate(hours, minutes, date);

  return combineDateAndTime(
    adjustedDate,
    `${doubleDigit(hours)}:${doubleDigit(minutes)}`,
    "Europe/Helsinki"
  );
};
