import {observer} from "mobx-react-lite";
import React, {useMemo} from "react";
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
import {text, Text} from "../../helpers/text";
import {getMomentFromDateTime} from "../../helpers/time";

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

const TooltipText = styled.div`
  font-family: var(--font-family);
  font-size: 1.2em;
  font-weight: 700;
  color: var(--blue);
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
  temperature = false,
  temperatureIsUncertain = true,
  roadCondition = false,
  roadConditionIsUncertain = true,
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
          <Text>map.road</Text>: {roadCondition}
        </RoadStatus>
      )}
    </WeatherContainer>
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

const WeatherDisplay = decorate(({className, state, position}) => {
  const {date, time} = state;
  const debouncedTime = useDebouncedValue(time, 1000);

  const startDate = useMemo(
    () => getMomentFromDateTime(date, debouncedTime).toISOString(true),
    [date, debouncedTime]
  );

  const [weatherData] = useWeather(position, startDate);
  const parsedWeatherData = useWeatherData(weatherData);

  return (
    <>
      {/*<Rectangle
        fill={false}
        color="var(--light-grey)"
        weight={1}
        dashArray="8 8"
        bounds={getWeatherSampleBounds(position)}
      />*/}
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
      <WeatherWidget {...parsedWeatherData} className={className} />
    </>
  );
});

export default WeatherDisplay;
