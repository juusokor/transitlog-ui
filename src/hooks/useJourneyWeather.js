import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import {useWeather} from "./useWeather";
import {latLngBounds, latLng} from "leaflet";
import {useMemo} from "react";

export const useJourneyWeather = (events, journeyId, onBounds = () => {}) => {
  const {minEvent, maxEvent} = useMemo(
    () => ({
      minEvent: events[0],
      maxEvent: events[events.length - 1],
    }),
    [typeof events[0] !== "undefined", journeyId]
  );

  const minPosition = minEvent ? latLng(minEvent.lat, minEvent.long) : null;
  const maxPosition = maxEvent ? latLng(maxEvent.lat, maxEvent.long) : null;

  const bounds = useMemo(
    () =>
      minPosition && maxPosition ? latLngBounds(minPosition, maxPosition) : null,
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
  // so we let the weather hook create a square bounding box.
  const routeBounds = useMemo(() => {
    if (!bounds) {
      return null;
    }

    const center = bounds.getCenter();
    const squareBounds = center.toBounds(8000);
    squareBounds.extend(minPosition.toBounds(5000));
    squareBounds.extend(maxPosition.toBounds(5000));

    return squareBounds;
  }, [bounds, minPosition, maxPosition]);

  return useWeather(routeBounds, endDate, startDate);
};
