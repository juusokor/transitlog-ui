import {observer} from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";
import {useDebouncedValue} from "../../hooks/useDebouncedValue";
import {useWeatherData} from "../../hooks/useWeatherData";

const WeatherContainer = styled.div`
  position: absolute;
  z-index: 500;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.5);
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
  const debouncedTime = useDebouncedValue(time);
  const [weatherData] = useWeather(position, date, debouncedTime);

  const {
    temperature,
    temperatureIsUncertain,
    roadCondition,
    roadConditionIsUncertain,
  } = useWeatherData(weatherData);

  return (
    <WeatherWidget
      temperature={temperature}
      temperatureIsUncertain={temperatureIsUncertain}
      roadCondition={roadCondition}
      roadConditionIsUncertain={roadConditionIsUncertain}
      className={className}
    />
  );
});

export default WeatherDisplay;
