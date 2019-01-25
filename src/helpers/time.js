import moment from "moment-timezone";
import doubleDigit from "./doubleDigit";

const num = (val) => parseInt(val, 10);

export function timeToSeconds(timeStr) {
  const [hours = 0, minutes = 0, seconds = 0] = timeStr.split(":");
  return num(seconds) + num(minutes) * 60 + num(hours) * 60 * 60;
}

export function getNormalTime(time) {
  let [hours = 0, minutes = 0, seconds = 0] = time.split(":");

  if (parseInt(hours, 10) > 23) {
    hours = hours - 24;
  }

  return getTimeString(hours, minutes, seconds);
}

export function getTimeString(hours = 0, minutes = 0, seconds = 0) {
  return `${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`;
}

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

export function journeyStartTime(event, useDate) {
  const eventDate = useDate
    ? useDate
    : moment.tz(event.received_at, "Europe/Helsinki").format("YYYY-MM-DD");

  if (eventDate !== event.oday) {
    let [hours, minutes, seconds] = event.journey_start_time.split(":");
    hours = parseInt(hours, 10) + 24;
    return getTimeString(hours, minutes, seconds);
  }

  return event.journey_start_time;
}

// Return the departure time as a 24h+ time string
export function departureTime(departure) {
  const {isNextDay, hours, minutes} = departure;
  const hour = isNextDay ? hours + 24 : hours;
  return getTimeString(hour, minutes);
}

export function getTimeRange(date) {
  const queryMoment = date.seconds(0);

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
