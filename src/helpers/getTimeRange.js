import setSeconds from "date-fns/set_seconds";
import {createDateTime} from "./createDateTime";
import setMinutes from "date-fns/set_minutes";
import addHours from "date-fns/add_hours";
import getMinutes from "date-fns/get_minutes";

export function getTimeRange(date, time) {
  const queryDateTime = setSeconds(createDateTime(date, time), 0);

  const quarter = Math.round((getMinutes(queryDateTime) / 60) * 100);
  let minMinutes;
  let maxMinutes;
  let maxAddHours = 0;

  if (quarter <= 25) {
    minMinutes = 0;
    maxMinutes = 15;
  } else if (quarter <= 50) {
    minMinutes = 15;
    maxMinutes = 30;
  } else if (quarter <= 75) {
    minMinutes = 30;
    maxMinutes = 45;
  } else {
    minMinutes = 45;
    maxMinutes = 0;
    maxAddHours = 1;
  }

  const min = setMinutes(queryDateTime, minMinutes);
  const max = addHours(setMinutes(queryDateTime, maxMinutes), maxAddHours);

  return {max, min};
}
