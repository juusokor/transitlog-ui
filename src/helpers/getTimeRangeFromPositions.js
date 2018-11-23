import moment from "moment-timezone";
import get from "lodash/get";
import last from "lodash/last";

export const dateToSeconds = (date) => {
  return Math.abs(date.diff(moment(date).startOf("day"), "seconds"));
};

export function getTimeRangeFromPositions(positions, MIN, MAX) {
  const min =
    positions.length !== 0
      ? dateToSeconds(
          moment(get(positions, "[0].received_at", 0)).tz("Europe/Helsinki")
        )
      : MIN;

  const max =
    positions.length !== 0
      ? dateToSeconds(
          moment(get(last(positions), "received_at", 0)).tz("Europe/Helsinki")
        )
      : MAX;

  return {min, max};
}
