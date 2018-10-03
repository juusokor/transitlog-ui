import getMinutes from "date-fns/get_minutes";
import setMinutes from "date-fns/set_minutes";
import addHours from "date-fns/add_hours";

export function roundTime(time, ccw = false) {
  let minutes = getMinutes(time);
  let hoursToAdd = 0;

  if (minutes === 0) {
    return time;
  }

  if (!ccw) {
    if (minutes <= 15) minutes = 15;
    else if (minutes <= 30) minutes = 30;
    else if (minutes <= 45) minutes = 45;
    else if (minutes > 45) {
      minutes = 0;
      hoursToAdd = 1;
    }
  } else {
    if (minutes < 15) minutes = 0;
    else if (minutes < 30) minutes = 15;
    else if (minutes < 45) minutes = 30;
    else if (minutes <= 59) minutes = 45;
  }

  const nextTime = addHours(setMinutes(time, minutes), hoursToAdd);
  return nextTime;
}
