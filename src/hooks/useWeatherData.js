import {useRef} from "react";
import get from "lodash/get";
import meanBy from "lodash/meanBy";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";

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

export const useWeatherData = (weatherData) => {
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

  return {
    temperature,
    roadCondition: roadStatusTerm,
    temperatureIsUncertain: weatherLocations.length === 0,
    roadConditionIsUncertain: roadConditionLocations.length === 0,
  };
};
