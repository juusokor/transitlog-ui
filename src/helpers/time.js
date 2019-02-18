import moment from "moment-timezone";
import doubleDigit from "./doubleDigit";
import {TIMEZONE} from "../constants";

const num = (val) => parseInt(val, 10);

export function timeToSeconds(timeStr = "") {
  const [hours = 0, minutes = 0, seconds = 0] = (timeStr || "").split(":");
  return num(seconds) + num(minutes) * 60 + num(hours) * 60 * 60;
}

export function secondsToTimeObject(seconds) {
  const absSeconds = Math.abs(seconds);

  const totalSeconds = Math.floor(absSeconds % 60);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const hours = Math.floor(absSeconds / 60 / 60);

  return {
    hours,
    minutes,
    seconds: totalSeconds,
  };
}

export function secondsToTime(secondsDuration) {
  const {hours = 0, minutes = 0, seconds = 0} = secondsToTimeObject(secondsDuration);
  return getTimeString(hours, minutes, seconds);
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

export function getMomentFromDateTime(date, time = "00:00:00", timezone = TIMEZONE) {
  // Get the seconds elapsed during the date. The time can be a 24h+ time.
  const seconds = timeToSeconds(time);
  // Create a moment from the date and add the seconds.
  return moment.tz(date, timezone).add(seconds, "seconds");
}

export function journeyStartTime(event, useMoment) {
  if (!event || !event.journey_start_time) {
    return "";
  }

  const eventMoment = useMoment ? useMoment : moment.tz(event.tst, TIMEZONE);

  let [hours, minutes, seconds] = event.journey_start_time.split(":");
  const intHours = parseInt(hours, 10);

  /*
   Check this if something seems off with midnight journeys. 12 was chosen
   as a convenient mid-point time that would only appear once in a 24h+ day.
  */

  // TODO: Fix for area query

  if (
    // If the journey start hour was before 12 (ie very early) and the received at time
    // was after, we can assume that this journey is at the late end of a 24h+ day.
    // Otherwise check if the oday and the received at date don't match.
    ((hours < 12 && eventMoment.hours() >= 12) ||
      event.oday !== eventMoment.format("YYYY-MM-DD")) &&
    intHours < 24
  ) {
    hours = intHours + 24;
    return getTimeString(hours, minutes, seconds);
  }

  return event.journey_start_time;
}

export function journeyEventTime(event) {
  if (!event || !event.journey_start_time) {
    return "";
  }

  const receivedAtMoment = moment.tz(event.tst, TIMEZONE);

  let hours = receivedAtMoment.hours();
  let minutes = receivedAtMoment.minutes();
  let seconds = receivedAtMoment.seconds();

  if (event.oday !== receivedAtMoment.format("YYYY-MM-DD")) {
    hours = hours + 24;
  }

  return getTimeString(hours, minutes, seconds);
}

// Return the departure time as a 24h+ time string
export function departureTime(departure, useArrival = false) {
  let {isNextDay, hours, minutes} = departure;

  if (useArrival) {
    hours = departure.arrivalHours;
    minutes = departure.arrivalMinutes;
  }

  const hour = isNextDay ? hours + 24 : hours;
  return getTimeString(hour, minutes);
}
