import moment from "moment-timezone";
import get from "lodash/get";
import last from "lodash/last";

export const dateToSeconds = (date, operationDay) => {
  return date.diff(operationDay, "seconds");
};

export function getTimeRangeFromPositions(positions) {
  if (positions.length === 0) {
    return null;
  }

  const startTime = get(positions, "[0].received_at");
  const operationDay = moment.tz(startTime, "Europe/Helsinki").startOf("day");

  const minMoment = moment.tz(startTime, "Europe/Helsinki");
  const maxMoment = moment.tz(
    get(last(positions), "received_at"),
    "Europe/Helsinki"
  );

  return {
    min: dateToSeconds(minMoment, operationDay),
    max: dateToSeconds(maxMoment, operationDay),
  };
}
