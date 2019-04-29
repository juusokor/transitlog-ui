import {observer} from "mobx-react-lite";
import React, {useMemo} from "react";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";
import {CircleMarker} from "react-leaflet";
import {latLng} from "leaflet";
import {getMomentFromDateTime} from "../../helpers/time";

const decorate = flow(
  observer,
  inject("state")
);

const WeatherMarker = ({location, color}) => (
  <CircleMarker
    radius={7}
    fill={true}
    fillColor={color}
    fillOpacity={1}
    stroke={false}
    interactive={false}
    center={latLng(get(location, "position", []).map((c) => parseFloat(c)))}
  />
);

const WeatherDisplay = decorate(({state}) => {
  const {date} = state;

  const weatherTime = useMemo(
    () =>
      getMomentFromDateTime(date)
        .startOf("day")
        .add(12, "hours")
        .toISOString(true),
    []
  );

  const [weatherData] = useWeather("all", weatherTime);

  return (
    <>
      {weatherData && (
        <>
          {get(weatherData, "weather.locations", []).map((weatherLocation) => {
            return (
              <WeatherMarker
                key={`weather_marker_${weatherLocation.info.id}`}
                color="var(--light-blue)"
                location={weatherLocation.info}
              />
            );
          })}
          {get(weatherData, "roadCondition.locations", []).map((roadLocation) => {
            return (
              <WeatherMarker
                color="var(--light-grey)"
                location={roadLocation.info}
                key={`road_marker_${roadLocation.info.id}`}
              />
            );
          })}
        </>
      )}
    </>
  );
});

export default WeatherDisplay;
