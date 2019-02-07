import get from "lodash/get";
import moment from "moment-timezone";
import {getAdjustedDepartureDate} from "../../../helpers/getAdjustedDepartureDate";
import {secondsToTimeObject} from "../../../helpers/time";
import {TIMEZONE} from "../../../constants";

// Reusable higher-order function for calculating the planned arrival time from
// the departure time and the terminal time for the first stop of a route.

export default function CalculateTerminalTime({
  departure,
  event,
  date,
  recovery = false,
  children,
}) {
  const receivedAt = get(event, "received_at", null);
  const observedTime = moment.tz(receivedAt, TIMEZONE);
  const plannedTime = getAdjustedDepartureDate(departure, date, recovery);
  const bufferTime = get(departure, recovery ? "recoveryTime" : "terminalTime", 0);

  const diff = observedTime.diff(plannedTime, "seconds");
  const sign = diff < 0 ? "-" : diff > 0 ? "+" : "";

  const {seconds: diffSeconds, minutes: diffMinutes} = secondsToTimeObject(
    Math.abs(diff)
  );

  let wasLate;
  let offsetTime;

  if (recovery) {
    wasLate = diff < 0 ? false : diff > bufferTime * 60;
    offsetTime = plannedTime;
  } else {
    wasLate = diff > -(bufferTime * 60);
    offsetTime = plannedTime.clone().subtract(bufferTime, "minutes");
  }

  return children({
    offsetTime,
    wasLate,
    diffMinutes,
    diffSeconds,
    sign,
    diff,
  });
}
