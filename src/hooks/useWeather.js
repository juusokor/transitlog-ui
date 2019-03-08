import {useState, useEffect, useRef, useCallback} from "react";
import {getMomentFromDateTime} from "../helpers/time";
import moment from "moment-timezone";
import {getWeatherForArea} from "../helpers/getWeatherForArea";
import {getRoadConditionsForArea} from "../helpers/getRoadConditionsForArea";
import merge from "lodash/merge";
import {floorMoment} from "../helpers/roundMoment";
import {getRoundedBbox} from "../helpers/getRoundedBbox";
import {LatLngBounds} from "leaflet";

export function getWeatherSampleBounds(point) {
  let validPoint = point || null;
  let bounds = null;

  if (point instanceof LatLngBounds) {
    // If this is a bounds, get the center point as we want to always
    // have a standard-sized area.
    bounds = point;
  } else {
    // Convert the point to a bounds of 8 square kilometers.
    bounds = validPoint ? validPoint.toBounds(8000) : null;
  }

  return getRoundedBbox(bounds);
}

export const useWeather = (point, date, time) => {
  const cancelCallbacks = useRef([]);
  const onCancel = useCallback(() => {
    cancelCallbacks.current.forEach((cb) => cb());
  }, [cancelCallbacks.current]);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const roundedBounds = getWeatherSampleBounds(point);
  const bbox = roundedBounds ? roundedBounds.toBBoxString() : "";

  useEffect(() => {
    if (weatherLoading || !bbox) {
      return onCancel;
    }

    cancelCallbacks.current = [];

    const dateTime = moment.min(
      floorMoment(
        moment.isMoment(date) ? date : getMomentFromDateTime(date, time),
        10,
        "minutes"
      ),
      floorMoment(moment(), 10, "minutes")
    );

    const weatherEnd = dateTime.toDate();
    const weatherStart = dateTime
      .clone() // Clone to not interfere with road condition times
      .subtract(20, "minutes")
      .toDate();

    const roadEnd = dateTime.startOf("hour").toDate();
    const roadStart = dateTime.subtract(1, "hour").toDate();

    setWeatherLoading(true);

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
