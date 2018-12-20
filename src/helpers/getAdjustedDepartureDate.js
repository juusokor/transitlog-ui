import moment from "moment-timezone";
import {combineDateAndTime} from "./time";
import doubleDigit from "./doubleDigit";

/**
 * Creates a moment from a departure time with 30-hour day adjustments applied.
 *
 * @param departure
 * @param date
 * @returns Moment
 */
export const getAdjustedDepartureDate = (departure, date) => {
  const adjustedDate =
    (departure.hours === 4 && departure.minutes < 30) || departure.hours < 4
      ? moment
          .tz(date, "Europe/Helsinki")
          .add(1, "day")
          .format("YYYY-MM-DD")
      : date;

  return combineDateAndTime(
    adjustedDate,
    `${doubleDigit(departure.hours)}:${doubleDigit(departure.minutes)}`,
    "Europe/Helsinki"
  );
};
