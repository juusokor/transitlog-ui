import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import {useWeather} from "./useWeather";
import {latLngBounds, latLng} from "leaflet";
import {useMemo} from "react";

export const useJourneyWeather = (events, journeyId) => {
  const {minEvent, maxEvent} = useMemo(
    () => ({
      minEvent: events[0],
      maxEvent: events[events.length - 1],
    }),
    [typeof events[0] !== "undefined", journeyId]
  );

  const minPosition =
    minEvent && minEvent.lat ? latLng(minEvent.lat, minEvent.long) : null;

  const maxPosition =
    maxEvent && maxEvent.lat ? latLng(maxEvent.lat, maxEvent.long) : null;

  const bounds = useMemo(
    () => (minPosition && maxPosition ? latLngBounds(minPosition, maxPosition) : null),
    [minPosition, maxPosition]
  );

  const startDate = useMemo(
    () =>
      minEvent
        ? moment
            .tz(minEvent.tst, TIMEZONE)
            .startOf("hour")
            .toISOString(true)
        : null,
    [minEvent]
  );

  const endDate = useMemo(
    () =>
      maxEvent
        ? moment
            .tz(maxEvent.tst, TIMEZONE)
            .endOf("hour")
            .toISOString(true)
        : null,
    [maxEvent]
  );

  // Routes can be quite one-dimensional (straight-ish line horizontally or vertically),
  // so first create a new bbox from the center of the route and extend it over the
  // start and end points with 5 km^2 of padding at either end.
  const routeBounds = useMemo(() => {
    if (!bounds) {
      return null;
    }

    const center = bounds.getCenter();
    const squareBounds = center.toBounds(8000); // 8km^2 bbox from the center
    squareBounds.extend(minPosition.toBounds(5000)); // Extend bounds to contain 5km^2 around the start position
    squareBounds.extend(maxPosition.toBounds(5000)); // Extend bounds to contain 5km^2 around the end position

    return squareBounds;
  }, [bounds, minPosition, maxPosition]);

  return useWeather(routeBounds, endDate, startDate);
};
