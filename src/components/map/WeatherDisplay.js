import {observer} from "mobx-react-lite";
import React, {useMemo} from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import get from "lodash/get";
import meanBy from "lodash/meanBy";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";
import {getRoadStatus} from "../../hooks/useWeatherData";
import {CircleMarker, Tooltip} from "react-leaflet";
import {latLng, latLngBounds} from "leaflet";
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
    center={latLng(get(location, "position", []).map((c) => parseFloat(c)))}>
    <Tooltip offset={[10, 0]}>{children}</Tooltip>
  </CircleMarker>
);

const hslBBox = latLngBounds([[59.91326, 23.983637], [60.629925, 25.285678]]);

const WeatherDisplay = decorate(({state}) => {
  const {date, time} = state;

  const startDate = useMemo(
    () =>
      getMomentFromDateTime(date, time)
        .startOf("hour")
        .toISOString(true),
    [date, time]
  );

  const [weatherData] = useWeather(hslBBox, startDate);

  return (
    <>
      {weatherData && (
        <>
          {get(weatherData, "weather.locations", []).map((weatherLocation) => {
            let temp = meanBy(
              get(weatherLocation, "data.t2m.timeValuePairs", []),
              "value"
            );

            temp = isNaN(temp)
              ? text("general.no_data")
              : Math.round(temp * 10) / 10 + " &deg;C";

            return (
              <WeatherMarker
                key={`weather_marker_${weatherLocation.info.id}`}
                color="var(--light-blue)"
                location={weatherLocation.info}>
                <TooltipText dangerouslySetInnerHTML={{__html: temp}} />
              </WeatherMarker>
            );
          })}
          {get(weatherData, "roadCondition.locations", []).map((roadLocation) => {
            let roadStatus = getRoadStatus([roadLocation]);

            return (
              <WeatherMarker
                color="var(--light-grey)"
                location={roadLocation.info}
                key={`road_marker_${roadLocation.info.id}`}>
                <TooltipText>
                  <Text>map.road</Text>: {roadStatus || text("general.no_data")}
                </TooltipText>
              </WeatherMarker>
            );
          })}
        </>
      )}
    </>
  );
});

export default WeatherDisplay;
