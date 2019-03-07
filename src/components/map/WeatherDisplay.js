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
  top: 0;
  left: 0;
  min-width: 20rem;
  padding: 0.25rem 3rem 1.5rem 0.5rem;
  background: radial-gradient(
    ellipse at top left,
    rgba(0, 98, 161, 0.875) 0,
    rgba(0, 98, 161, 0) 70%
  );
  color: white;
`;

const Temperature = styled.div`
  font-size: 1.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.75);
`;

const RoadStatus = styled.div`
  font-size: 1rem;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 1);
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

  const {weather, roadCondition} = weatherData || {};
  const prevTemperature = useRef(false);
  const weatherLocations = get(weather, "locations", []);
  const roadConditionLocations = get(roadCondition, "locations", []);

  const areaAverage = getAverageValue(weatherLocations, "t2m");
  const roadStatus = getRoadStatus(roadConditionLocations);

  const temperature =
    areaAverage !== false
      ? Math.round(areaAverage * 10) / 10
      : prevTemperature.current;

  if (temperature !== false) {
    prevTemperature.current = temperature;
  }

  return (
    (temperature !== false || roadStatus.length !== 0) && (
      <WeatherContainer className={className}>
        {temperature !== false && <Temperature>{temperature} &deg;C</Temperature>}
        {roadStatus.length !== 0 && <RoadStatus>Road: {roadStatus}</RoadStatus>}
      </WeatherContainer>
    )
  );
});

export default WeatherDisplay;
