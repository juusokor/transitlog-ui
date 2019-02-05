import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";
import orderBy from "lodash/orderBy";
import {intval, isWithinRange} from "./isWithinRange";

export function filterDepartures(departures, date = false) {
  let deps = departures;

  if (date) {
    deps = departures.filter((departure) => {
      return isWithinRange(date, departure.dateBegin, departure.dateEnd);
    });
  }

  // The departures may contain items that are identical and have overlapping
  // in-effect ranges resulting in doubles showing up in the UI lists.
  // They are filtered out here.
  const groupedDepartures = groupBy(
    deps,
    (departure) =>
      departure.routeId +
      departure.direction +
      departure.hours +
      departure.minutes +
      departure.stopId +
      departure.dayType +
      departure.extraDeparture
  );

  // Pick the most recent departure item from each group.
  return reduce(
    groupedDepartures,
    (filteredDepartures, departures) => {
      filteredDepartures.push(
        // Pick the most recent departure item by sorting it first in the list.
        orderBy(departures, ({dateBegin}) => intval(dateBegin), "desc")[0]
      );
      return filteredDepartures;
    },
    []
  );
}
