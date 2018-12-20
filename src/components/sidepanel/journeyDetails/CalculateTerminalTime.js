import get from "lodash/get";
import moment from "moment-timezone";
import {getAdjustedDepartureDate} from "../../../helpers/getAdjustedDepartureDate";

export default function CalculateTerminalTime({departure, event, date, children}) {
  const receivedAt = get(event, "received_at", null);
  const observedDepartureTime = moment.tz(receivedAt, "Europe/Helsinki");
  const plannedDepartureTime = getAdjustedDepartureDate(departure, date);
  const terminalTime = get(departure, "terminalTime", 3);

  const offsetTime = plannedDepartureTime.clone().subtract(terminalTime, "minutes");
  const diff = plannedDepartureTime.diff(observedDepartureTime, "seconds");

  const sign = diff < 0 ? "+" : diff > 0 ? "-" : "";
  const diffSeconds = Math.abs(diff) % 60;
  const diffMinutes = Math.floor(Math.abs(diff) / 60);

  const wasLate = diff < terminalTime * 60;

  return children({offsetTime, wasLate, diffMinutes, diffSeconds, sign});
}
