import {Text} from "../../helpers/text";
import React, {useMemo} from "react";
import styled from "styled-components";
import {useDebouncedValue} from "../../hooks/useDebouncedValue";
import {getMomentFromDateTime} from "../../helpers/time";
import {useWeather} from "../../hooks/useWeather";
import {useWeatherData} from "../../hooks/useWeatherData";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import {useJourneyWeather} from "../../hooks/useJourneyWeather";
import {roundMoment, floorMoment} from "../../helpers/roundMoment";

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
  color: ${({uncertain = false}) => (uncertain ? "var(--light-grey)" : "var(--blue)")};
`;

const RoadStatus = styled.div`
  font-size: 1em;
  color: ${({uncertain = false}) => (uncertain ? "var(--light-grey)" : "var(--blue)")};
`;

const decorate = flow(
  observer,
  inject("state")
);

const WeatherWidgetComponent = ({
  className,
  temperature = false,
  temperatureIsUncertain = true,
  roadCondition = false,
  roadConditionIsUncertain = true,
}) =>
  (temperature !== false || roadCondition) && (
    <WeatherContainer className={className}>
      {temperature !== false && (
        <Temperature uncertain={temperatureIsUncertain}>{temperature} &deg;C</Temperature>
      )}
      {roadCondition.length !== 0 && (
        <RoadStatus uncertain={roadConditionIsUncertain}>
          <Text>map.road</Text>: {roadCondition}
        </RoadStatus>
      )}
    </WeatherContainer>
  );

export const WeatherWidget = decorate(({position, className, state}) => {
  const {timeMoment} = state;
  const debouncedTime = useDebouncedValue(timeMoment, 1000);

  const startDate = useMemo(
    () => floorMoment(debouncedTime.clone(), 10, "minutes").toISOString(true),
    [debouncedTime]
  );

  const [weatherData] = useWeather(position, startDate);
  const parsedWeatherData = useWeatherData(weatherData);

  return <WeatherWidgetComponent {...parsedWeatherData} className={className} />;
});

export const JourneyWeatherWidget = ({position, className}) => {
  const [weatherData] = useJourneyWeather(position);
  const parsedWeatherData = useWeatherData(weatherData);

  return <WeatherWidgetComponent {...parsedWeatherData} className={className} />;
};
