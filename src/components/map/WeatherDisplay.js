import {observer} from "mobx-react-lite";
import React, {useRef} from "react";
import styled from "styled-components";
import get from "lodash/get";
import meanBy from "lodash/meanBy";
import uniqBy from "lodash/uniqBy";
import flow from "lodash/flow";
import orderBy from "lodash/orderBy";
import {inject} from "../../helpers/inject";
import {useWeather} from "../../hooks/useWeather";
import {useDebouncedValue} from "../../hooks/useDebouncedValue";

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
`;

const Temperature = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({uncertain = false}) =>
    uncertain ? "var(--light-grey)" : "var(--blue)"};
`;

const RoadStatus = styled.div`
  font-size: 1rem;
  color: ${({uncertain = false}) =>
    uncertain ? "var(--light-grey)" : "var(--blue)"};
`;

function getValues(locations, value) {
  return locations.reduce((values, {data}) => {
    const timeValuePairs = get(data, `${value}.timeValuePairs`, []).filter(
      ({value}) => !isNaN(value)
    );

    return [...values, ...timeValuePairs];
  }, []);
}

function getAverageValue(locations, value) {
  const timeValues = getValues(locations, value);
  const average = meanBy(timeValues, "value");
  return isNaN(average) ? false : average;
}

const roadConditionStatus = {
  "1": "dry",
  "2": "damp",
  "3": "wet",
  "4": "wet snow",
  "5": "frost",
  "6": "partly icy",
  "7": "dry snow",
  "8": "icy",
};

function getRoadStatus(locations) {
  const timeValues = getValues(locations, "rscst");
  const status = orderBy(uniqBy(timeValues, "value"), "value", "desc")[0];
  return get(roadConditionStatus, `${get(status, "value")}`, "");
}

const decorate = flow(
  observer,
  inject("state")
);

const WeatherDisplay = decorate(({className, state, position}) => {
  const {date, time} = state;
  const debouncedTime = useDebouncedValue(time);
  const [weatherData] = useWeather(position, date, debouncedTime);
  const prevData = useRef({});

  const {weather, roadCondition} = weatherData || {};

  const weatherLocations = get(weather, "locations", []);
  const roadConditionLocations = get(roadCondition, "locations", []);

  const areaAverage = getAverageValue(weatherLocations, "t2m");
  const roadStatus = getRoadStatus(roadConditionLocations);

  const temperature =
    areaAverage !== false
      ? Math.round(areaAverage * 10) / 10
      : get(prevData, "current.weather", false);

  const roadStatusTerm = roadStatus || get(prevData, "current.roadStatus", "");

  if (temperature !== false) {
    prevData.current.weather = temperature;
  }

  if (roadStatusTerm) {
    prevData.current.roadStatus = roadStatusTerm;
  }

  return (
    (temperature !== false || roadStatusTerm.length !== 0) && (
      <WeatherContainer className={className}>
        {temperature !== false && (
          <Temperature uncertain={weatherLocations.length === 0}>
            {temperature} &deg;C
          </Temperature>
        )}
        {roadStatusTerm.length !== 0 && (
          <RoadStatus uncertain={roadConditionLocations.length === 0}>
            Road: {roadStatusTerm}
          </RoadStatus>
        )}
      </WeatherContainer>
    )
  );
});

export default WeatherDisplay;
