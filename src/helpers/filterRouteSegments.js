import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";
import orderBy from "lodash/orderBy";
import {intval, isWithinRange} from "./isWithinRange";

export function filterRouteSegments(routeSegments, date = false) {
  let validSegments = routeSegments;

  if (date) {
    validSegments = routeSegments.filter((segment) => {
      return isWithinRange(date, segment.dateBegin, segment.dateEnd);
    });
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
  return reduce(
    groupedSegments,
    (filteredSegments, segments) => {
      filteredSegments.push(
        // Pick the most recent segment item by sorting it first in the list.
        orderBy(segments, ({dateBegin}) => intval(dateBegin), "desc")[0]
      );
      return filteredSegments;
    },
    []
  );
}
