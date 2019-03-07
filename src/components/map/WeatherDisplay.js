import {observer} from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import get from "lodash/get";
import meanBy from "lodash/meanBy";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";
import {useDebouncedValue} from "../../hooks/useDebouncedValue";
import {useWeatherData, getRoadStatus} from "../../hooks/useWeatherData";
import {CircleMarker, Tooltip} from "react-leaflet";
import {latLng} from "leaflet";

const WeatherContainer = styled.div`
  position: absolute;
  z-index: 500;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 5px;
  border: 1px solid var(--alt-grey);
  font-family: var(--font-family);
  font-size: 1rem;
`;

const Temperature = styled.div`
  font-size: 1.4em;
  font-weight: 700;
  color: ${({uncertain = false}) =>
    uncertain ? "var(--light-grey)" : "var(--blue)"};
`;

const RoadStatus = styled.div`
  font-size: 1em;
  color: ${({uncertain = false}) =>
    uncertain ? "var(--light-grey)" : "var(--blue)"};
`;

const decorate = flow(
  observer,
  inject("state")
);

export const WeatherWidget = ({
  temperature,
  temperatureIsUncertain,
  roadCondition,
  roadConditionIsUncertain,
  className,
}) =>
  (temperature !== false || roadCondition) && (
    <WeatherContainer className={className}>
      {temperature !== false && (
        <Temperature uncertain={temperatureIsUncertain}>
          {temperature} &deg;C
        </Temperature>
      )}
      {roadCondition.length !== 0 && (
        <RoadStatus uncertain={roadConditionIsUncertain}>
          Road: {roadCondition}
        </RoadStatus>
      )}
    </WeatherContainer>
  );

const WeatherDisplay = decorate(({className, state, position}) => {
  const {date, time} = state;
  const debouncedTime = useDebouncedValue(time, 1000);
  const [weatherData] = useWeather(position, date, debouncedTime);

  const parsedWeatherData = useWeatherData(weatherData);

  return (
    <>
      {weatherData &&
        get(weatherData, "weather.locations", []).map((weatherLocation) => {
          let temp = meanBy(
            get(weatherLocation, "data.t2m.timeValuePairs", []),
            "value"
          );

          temp = isNaN(temp) ? "?" : Math.round(temp * 10) / 10;

          return (
            <CircleMarker
              radius={7}
              fillColor="var(--light-blue)"
              fillOpacity={1}
              color="white"
              weight={2}
              key={`weather_marker_${weatherLocation.info.id}`}
              center={latLng(
                get(weatherLocation, "info.position", []).map((c) => parseFloat(c))
              )}>
              <Tooltip offset={[10, 0]}>
                <Temperature>{temp} &deg;C</Temperature>
              </Tooltip>
            </CircleMarker>
          );
        })}
      {weatherData &&
        get(weatherData, "roadCondition.locations", []).map((roadLocation) => {
          let roadStatus = getRoadStatus([roadLocation]);

          return (
            <CircleMarker
              radius={7}
              fillColor="var(--lighter-grey)"
              fillOpacity={1}
              color="var(--dark-grey)"
              weight={2}
              key={`road_marker_${roadLocation.info.id}`}
              center={latLng(
                get(roadLocation, "info.position", []).map((c) => parseFloat(c))
              )}>
              <Tooltip offset={[10, 0]}>
                <RoadStatus>Road condition: {roadStatus || "unknown"}</RoadStatus>
              </Tooltip>
            </CircleMarker>
          );
        })}
      <WeatherWidget {...parsedWeatherData} className={className} />
    </>
  );
});

export default WeatherDisplay;
