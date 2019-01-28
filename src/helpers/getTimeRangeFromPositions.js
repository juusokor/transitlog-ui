import moment from "moment-timezone";
import get from "lodash/get";
import last from "lodash/last";

export const dateToSeconds = (date, operationDay) => {
  return date.diff(operationDay, "seconds");
};

/*
  Returns a range in seconds, relative to the operation day, for the provided array of hfp events.
  The min and max values are seconds passed since the start of the operation day.
 */

export function getTimeRangeFromPositions(positions) {
  if (positions.length === 0) {
    return null;
  }

  // The day when the journey is scheduled. This is the base that the seconds are relative to.
  const operationDay = moment
    .tz(get(positions, "[0].oday"), "Europe/Helsinki")
    .startOf("day");

  // Min and max moments for the position range
  const minMoment = moment.tz(get(positions, "[0].received_at"), "Europe/Helsinki");
  const maxMoment = moment.tz(
    get(last(positions), "received_at"),
    "Europe/Helsinki"
  );

  return {
    min: dateToSeconds(minMoment, operationDay),
    max: dateToSeconds(maxMoment, operationDay),
  };
}
