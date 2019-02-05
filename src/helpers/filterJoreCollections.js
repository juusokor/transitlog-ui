import {isWithinRange, intval} from "./isWithinRange";
import reduce from "lodash/reduce";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";

function ensureActive(items, date) {
  return items.filter((item) => {
    return isWithinRange(date, item.dateBegin, item.dateEnd);
  });
}

function reduceGroupsToNewestItem(groups) {
  return reduce(
    groups,
    (filtered, items) => {
      filtered.push(
        // Pick the most recent item by sorting it first in the list.
        orderBy(items, ({dateBegin}) => intval(dateBegin), "desc")[0]
      );
      return filtered;
    },
    []
  );
}

export function filterDepartures(departures, date) {
  let departureItems = departures;

  if (date) {
    departureItems = ensureActive(departureItems, date);
  }

  const groupedDepartures = groupBy(
    departureItems,
    (departure) =>
      departure.routeId +
      departure.direction +
      departure.hours +
      departure.minutes +
      departure.stopId +
      departure.dayType +
      departure.extraDeparture
  );

  return reduceGroupsToNewestItem(groupedDepartures);
}

export function filterRouteSegments(routeSegments, date = false) {
  let validSegments = routeSegments;

  if (date) {
    validSegments = ensureActive(validSegments, date);
  }

  // The departures may contain items that are identical and have overlapping
  // in-effect ranges resulting in doubles showing up in the UI lists.
  // They are filtered out here.
  const groupedSegments = groupBy(
    validSegments,
    (segment) =>
      segment.routeId +
      segment.direction +
      segment.stopId +
      segment.nextStopId +
      segment.stopIndex +
      segment.timingStopType
  );

  // Pick the most recent departure item from each group.
  return reduceGroupsToNewestItem(groupedSegments);
}

export function filterLines(lines, date) {
  let validLines = lines;

  if (date) {
    validLines = ensureActive(validLines, date);
  }

  const groupedLines = groupBy(validLines, "lineId");
  return reduceGroupsToNewestItem(groupedLines);
}
