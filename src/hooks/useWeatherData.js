import {useRef, useMemo} from "react";
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

function getClosestTimeValue(values, timestamp) {
  let prevClosest = 0;
  let selected = values[0];

  for (const value of values) {
    const {time} = value;
    const diff = Math.abs(timestamp - time);

    if (!prevClosest || diff < prevClosest) {
      selected = value;
      prevClosest = diff;

      if (diff < 10) {
        break;
      }
    }
  }

  return selected;
}

export function getAverageValue(locations, value) {
  const timeValues = getValues(locations, value);
  const average = meanBy(timeValues, "value");
  return isNaN(average) ? false : average;
}

export function getTimeValue(timestamp, locations, value) {
  const timeValues = getValues(locations, value);
  const timeValue = getClosestTimeValue(timeValues, timestamp);
  return get(timeValue, "value", false);
}

// TODO: add the correct road states.
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

export function getRoadStatus(locations, timestamp) {
  const timeValues = getValues(locations, "rscst");
  let status = {value: 1};

  if (timestamp) {
    status = getClosestTimeValue(timeValues, timestamp);
  } else {
    status = orderBy(uniqBy(timeValues, "value"), "value", "desc")[0];
  }
  return get(roadConditionStatus, `${Math.min(get(status, "value", 1), 8)}`, "");
}

export const useWeatherData = (weatherData, timestamp) => {
  const prevData = useRef({});

  return useMemo(() => {
    const {weather, roadCondition} = weatherData || {};

    const weatherLocations = get(weather, "locations", []);
    const roadConditionLocations = get(roadCondition, "locations", []);

    const areaTemperature = timestamp
      ? getTimeValue(timestamp, weatherLocations, "t2m")
      : getAverageValue(weatherLocations, "t2m");

    const roadStatus = getRoadStatus(roadConditionLocations, timestamp);

    const temperature =
      areaTemperature !== false
        ? Math.round(areaTemperature * 10) / 10
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
  }, [weatherData, timestamp, prevData.current]);
};
