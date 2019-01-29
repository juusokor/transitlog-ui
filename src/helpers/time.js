import moment from "moment-timezone";
import doubleDigit from "./doubleDigit";

const num = (val) => parseInt(val, 10);

export function timeToSeconds(timeStr) {
  const [hours = 0, minutes = 0, seconds = 0] = timeStr.split(":");
  return num(seconds) + num(minutes) * 60 + num(hours) * 60 * 60;
}

export function secondsToTime(seconds) {
  const totalHours = Math.floor(seconds / 3600);
  const totalMinutes = (seconds % 3600) / 60;
  const totalSeconds = seconds % 60;

  return getTimeString(totalHours, totalMinutes, totalSeconds);
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

export function getMomentFromDateTime(date, time = "00:00:00", timezone) {
  // Get the seconds elapsed during the date. The time can be a 24h+ time.
  const seconds = timeToSeconds(time);
  // Create a moment from the date and add the seconds.
  return moment.tz(date, timezone).add(seconds, "seconds");
}

export function journeyStartTime(event, useMoment) {
  const eventDate = useMoment
    ? useMoment
    : moment.tz(event.received_at, "Europe/Helsinki");

  let [hours, minutes, seconds] = event.journey_start_time.split(":");
  const intHours = parseInt(hours, 10);

  /*
    TODO: Check this if something seems off with midnight journeys. 12 was chosen
      semi-randomly as a time that would only appear once in a 24h+ day.
   */

  if (
    // If the journey start hour was before 12 (ie very early) and the received at time
    // was after, we can assume that this journey is at the late end of a 24h+ day.
    // Otherwise check if the oday and the received at date don't match.
    (intHours < 12 && eventDate.hours() >= 12) ||
    event.oday !== eventDate.format("YYYY-MM-DD")
  ) {
    hours = intHours + 24;
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
