import moment from "moment-timezone";

export function timeToFormat(value, toFormat, toTimezone, fromTimezone) {
  let date;

  if (fromTimezone) {
    date = moment.tz(value, fromTimezone);
  } else {
    date = moment(value);
  }

  if (toTimezone) {
    date = date.tz(toTimezone);
  }

  return date.format(toFormat);
}

export function combineDateAndTime(date, time = "00:00:00", timezone, toTimezone) {
  if (toTimezone && typeof toTimezone === "string") {
    return moment.tz(`${date} ${time}`, timezone).tz(toTimezone);
  } else {
    return moment.tz(`${date} ${time}`, timezone);
  }
}

export function getTimeRange(date) {
  const queryMoment = moment(date).seconds(0);

  const quarter = Math.round((queryMoment.minutes() / 60) * 100);
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

  const min = moment(queryMoment).minutes(minMinutes);
  const max = moment(queryMoment)
    .minutes(maxMinutes)
    .add(maxAddHours, "hours");

  return {max, min};
}
