import {useWeather, getWeatherSampleBounds} from "./useWeather";
import {useMemo} from "react";
import {latLng} from "leaflet";

export const useJourneyWeather = (position) => {
  const bounds = useMemo(() => getWeatherSampleBounds(latLng(position)), [position]);
  return useWeather(bounds, position.recordedAt);
};
