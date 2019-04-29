import {useWeather, getWeatherSampleSites} from "./useWeather";
import {latLng} from "leaflet";
import {useMemo} from "react";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";

export const useJourneyWeather = (events, journeyId) => {
  const {minEvent, maxEvent} = useMemo(
    () => ({
      minEvent: events[0],
      maxEvent: events[events.length - 1],
    }),
    [typeof events[0] !== "undefined", journeyId]
  );

  const minPosition = useMemo(
    () => (minEvent && minEvent.lat ? latLng(minEvent.lat, minEvent.lng) : null),
    [typeof events[0] !== "undefined", journeyId]
  );

  const maxPosition = useMemo(
    () => (maxEvent && maxEvent.lat ? latLng(maxEvent.lat, maxEvent.lng) : null),
    [typeof events[0] !== "undefined", journeyId]
  );

  const sites = useMemo(
    () => uniq(flatten([maxPosition, minPosition].map(getWeatherSampleSites))).sort(),
    [minPosition, maxPosition]
  );

  const startDate = useMemo(() => (minEvent ? minEvent.recordedAt : null), [minEvent]);
  const endDate = useMemo(() => (maxEvent ? maxEvent.recordedAt : null), [maxEvent]);

  return useWeather(sites, endDate, startDate);
};
