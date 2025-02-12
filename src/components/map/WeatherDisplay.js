import {observer} from "mobx-react-lite";
import React, {useMemo} from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import get from "lodash/get";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";
import {getRoadStatus, getClosestTimeValue} from "../../hooks/useWeatherData";
import {CircleMarker, Tooltip} from "react-leaflet";
import {latLng} from "leaflet";
import {text, Text} from "../../helpers/text";
import {getMomentFromDateTime} from "../../helpers/time";

const TooltipText = styled.div`
  font-family: var(--font-family);
  font-size: 1.2em;
  font-weight: 700;
  color: var(--blue);
`;

const decorate = flow(
  observer,
  inject("state")
);

const WeatherMarker = ({children, location, color}) => (
  <CircleMarker
    radius={7}
    fill={true}
    fillColor={color}
    fillOpacity={1}
    stroke={false}
    center={location}>
    <Tooltip offset={[10, 0]}>{children}</Tooltip>
  </CircleMarker>
);

const WeatherDisplay = decorate(({state}) => {
  const {date, unixTime} = state;

  // For this component, we only need the weather stations
  // and we don't want to update the data too often.

  const [startDate, endDate] = useMemo(
    () => [
      getMomentFromDateTime(date)
        .startOf("day")
        .toISOString(true),
      getMomentFromDateTime(date)
        .endOf("day")
        .toISOString(true),
    ],
    [date]
  );

  const [weatherData] = useWeather("all", endDate, startDate);

  const [weatherLocations, roadLocations] = useMemo(() => {
    const weatherLocations = get(weatherData, "weather.locations", []).map((location) => {
      const locationData = get(location, "data.t2m.timeValuePairs", []);

      return {
        data: locationData,
        id: get(location, "info.id", ""),
        location: latLng(get(location, "info.position", []).map((c) => parseFloat(c))),
      };
    });

    const roadLocations = get(weatherData, "roadCondition.locations", []).map(
      (location) => {
        const roadStatus = getRoadStatus([location], unixTime);
        return {
          data: roadStatus,
          id: get(location, "info.id", ""),
          location: latLng(get(location, "info.position", []).map((c) => parseFloat(c))),
        };
      }
    );

    return [weatherLocations, roadLocations];
  }, [weatherData.weather, weatherData.roadCondition]);

  return (
    <>
      {weatherLocations &&
        weatherLocations.length !== 0 &&
        weatherLocations.map((weatherLocation) => {
          let temp = getClosestTimeValue(weatherLocation.data, unixTime);

          temp = isNaN(temp.value)
            ? text("general.no_data")
            : Math.round(temp.value * 10) / 10 + " &deg;C";

          return (
            <WeatherMarker
              key={`weather_marker_${weatherLocation.id}`}
              color="var(--light-blue)"
              location={weatherLocation.location}>
              <TooltipText dangerouslySetInnerHTML={{__html: temp}} />
            </WeatherMarker>
          );
        })}
      {roadLocations &&
        roadLocations.length !== 0 &&
        roadLocations.map((roadLocation) => (
          <WeatherMarker
            color="var(--light-grey)"
            location={roadLocation.location}
            key={`road_marker_${roadLocation.id}`}>
            <TooltipText>
              <Text>map.road</Text>: {roadLocation.data || text("general.no_data")}
            </TooltipText>
          </WeatherMarker>
        ))}
    </>
  );
});

export default WeatherDisplay;
