import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import {useWeather} from "./useWeather";
import {latLngBounds} from "leaflet";
import {useMemo} from "react";

export const useJourneyWeather = (events, journeyId) => {
  const {minPosition, maxPosition} = useMemo(
    () => ({
      minPosition: events[0],
      maxPosition: events[events.length - 1],
    }),
    [typeof events[0] !== "undefined", journeyId]
  );

  const bounds = useMemo(
    () =>
      minPosition
        ? latLngBounds(
            [minPosition.lat, minPosition.long],
            [maxPosition.lat, maxPosition.long]
          )
        : null,
    [minPosition]
  );

  const startDate = useMemo(
    () =>
      minPosition
        ? moment
            .tz(minPosition.tst, TIMEZONE)
            .startOf("hour")
            .toISOString(true)
        : null,
    [minPosition]
  );

  const endDate = useMemo(
    () =>
      maxPosition
        ? moment
            .tz(maxPosition.tst, TIMEZONE)
            .endOf("hour")
            .toISOString(true)
        : null,
    [maxPosition]
  );
  // Routes can be quite one-dimensional (straight-ish line horizontally or vertically),
  // so we let the weather hook create a square bounding box.
  const point = useMemo(() => (bounds ? bounds.getCenter() : null), [bounds]);

  return useWeather(point, endDate, startDate);
};
