import get from "lodash/get";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

const AlertLevel = {
  Info: "INFO",
  Warning: "WARNING",
  Severe: "SEVERE",
};

const AlertDistribution = {
  Stop: "STOP",
  AllStops: "ALL_STOPS",
  Route: "ROUTE",
  AllRoutes: "ALL_ROUTES",
  Network: "NETWORK",
};

const timeProps = [
  "recordedAt",
  "events[0].recordedAt",
  "journey.events[0].recordedAt",
  "observedDepartureTime.departureDateTime",
  "plannedDepartureTime.departureDateTime",
  "observedArrivalTime.arrivalDateTime",
  "plannedArrivalTime.arrivalDateTime",
];

export const getAlertsInEffect = (
  objectWithAlerts,
  time,
  includeNetworkAlerts = false
) => {
  const objectTimeProp = timeProps.find((tp) => get(objectWithAlerts, tp, false));
  const alertTime = get(objectWithAlerts, objectTimeProp, time);
  // If the time is a shorter string, that means that it is a day without the time part.
  // In that case we should show all alerts for the day.
  const timeIsDate = typeof alertTime === "string" && alertTime.length < 11;
  const currentMoment = moment.tz(alertTime, TIMEZONE);

  return get(objectWithAlerts, "alerts", [])
    .reduce((levels, alert) => {
      if (
        levels.includes(alert.level) ||
        !currentMoment.isBetween(
          alert.startDateTime,
          alert.endDateTime,
          timeIsDate ? "day" : "minute",
          "[]"
        )
      ) {
        return levels;
      }

      if (includeNetworkAlerts && alert.distribution === AlertDistribution.Network) {
        levels.push(alert.level);
      } else if (
        (alert.distribution === AlertDistribution.Route &&
          objectWithAlerts.routeId === alert.affectedId) ||
        (alert.distribution === AlertDistribution.AllRoutes &&
          typeof objectWithAlerts.routeId !== "undefined")
      ) {
        levels.push(alert.level);
      } else if (
        (alert.distribution === AlertDistribution.Stop &&
          objectWithAlerts.stopId === alert.affectedId) ||
        (alert.distribution === AlertDistribution.AllStops &&
          typeof objectWithAlerts.stopId !== "undefined")
      ) {
        levels.push(alert.level);
      }

      return levels;
    }, [])
    .sort((a, b) => {
      const sortVal = {
        [AlertLevel.Severe]: 2,
        [AlertLevel.Warning]: 1,
        [AlertLevel.Info]: 0,
      };

      return sortVal[a] >= sortVal[b] ? -1 : 1;
    });
};
