import moment from "moment-timezone";
import get from "lodash/get";
import last from "lodash/last";

export const dateToSeconds = (date, operationDay) => {
  return Math.abs(date.diff(operationDay, "seconds"));
};

export function getTimeRangeFromPositions(positions, MIN, MAX) {
  if (positions.length === 0) {
    return {min: MIN, max: MAX};
  }

  const minMoment = moment(get(positions, "[0].received_at")).tz("Europe/Helsinki");

  const operationDay = moment
    .tz(get(positions, "[0].oday"), "Europe/Helsinki")
    .hours(4)
    .minutes(30);

  if (minMoment.isBefore(operationDay)) {
    operationDay.hours(minMoment.hours());
    operationDay.minutes(minMoment.minutes());
  }

  const maxMoment = moment(get(last(positions), "received_at")).tz(
    "Europe/Helsinki"
  );

  return {
    min: dateToSeconds(minMoment, operationDay),
    max: dateToSeconds(maxMoment, operationDay),
  };
}
