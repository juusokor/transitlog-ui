import {useState, useEffect, useRef, useCallback} from "react";
import {getMomentFromDateTime} from "../helpers/time";
import moment from "moment-timezone";
import {getWeatherForArea} from "../helpers/getWeatherForArea";
import {getRoadConditionsForArea} from "../helpers/getRoadConditionsForArea";
import merge from "lodash/merge";
import {floorMoment} from "../helpers/roundMoment";

// Round down to three decimals
function floor(number) {
  return Math.floor(number * 100) / 100;
}

// Round up to three decimals
function ceil(number) {
  return Math.ceil(number * 100) / 100;
}

function getRoundedBbox(bounds) {
  if (!bounds) {
    return "";
  }

  // Round the bounds to whole numbers
  const west = floor(bounds.getWest());
  const east = ceil(bounds.getEast());
  const north = ceil(bounds.getNorth());
  const south = floor(bounds.getSouth());

  return `${west},${south},${east},${north}`;
}

export const useWeather = (bounds, date, time) => {
  const cancelCallbacks = useRef([]);
  const onCancel = useCallback(() => {
    cancelCallbacks.current.forEach((cb) => cb());
  }, [cancelCallbacks.current]);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const bbox = getRoundedBbox(bounds);

  useEffect(() => {
    if (weatherLoading || !bbox) {
      return onCancel;
    }

    cancelCallbacks.current = [];

    const dateTime = moment.min(
      floorMoment(getMomentFromDateTime(date, time), 10, "minutes"),
      floorMoment(moment(), 10, "minutes")
    );

    setWeatherLoading(true);

    const weatherEnd = dateTime.toDate();
    const weatherStart = dateTime
      .clone()
      .subtract(30, "minutes")
      .toDate();

    const roadEnd = dateTime.startOf("hour").toDate();
    const roadStart = dateTime.subtract(1, "hour").toDate();

    const weatherPromise = getWeatherForArea(
      bbox,
      weatherStart,
      weatherEnd,
      (cancelCb) => cancelCallbacks.current.push(cancelCb)
    ).then((data) => ({weather: data}));

    const roadConditionPromise = getRoadConditionsForArea(
      bbox,
      roadStart,
      roadEnd,
      (cancelCb) => cancelCallbacks.current.push(cancelCb)
    ).then((data) => ({roadCondition: data}));

    Promise.all([weatherPromise, roadConditionPromise])
      .then((allData) => {
        setWeatherData(merge(...allData));
        setWeatherLoading(false);
      })
      .catch((err) => console.error(err));

    return onCancel;
  }, [date, time, bbox]);

  return [weatherData, weatherLoading];
};
