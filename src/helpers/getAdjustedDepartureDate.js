import moment from "moment-timezone";
import {combineDateAndTime} from "./time";
import doubleDigit from "./doubleDigit";

// Adjusts a 30-hour day time to it's equivalent 24-hour day time.
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

/**
 * Creates a moment from a departure time. Departure times follow the 30-hour day
 * schedule, so early morning times before 4:30 belong to the previous day.
 * Moments always use 24 hour days so it will be adjusted to work correctly.
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
