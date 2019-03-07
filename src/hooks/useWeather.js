import {useState, useEffect, useRef, useCallback} from "react";
import {getMomentFromDateTime} from "../helpers/time";
import moment from "moment-timezone";
import {getWeatherForArea} from "../helpers/getWeatherForArea";
import {getRoadConditionsForArea} from "../helpers/getRoadConditionsForArea";
import merge from "lodash/merge";
import {floorMoment} from "../helpers/roundMoment";
import {getRoundedBbox} from "../helpers/getRoundedBbox";
import {LatLngBounds} from "leaflet";

export const useWeather = (point, date, time) => {
  const cancelCallbacks = useRef([]);
  const onCancel = useCallback(() => {
    cancelCallbacks.current.forEach((cb) => cb());
  }, [cancelCallbacks.current]);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  let validPoint = point || null;

  if (point instanceof LatLngBounds) {
    validPoint = point.getCenter();
  }

  let bounds = validPoint ? validPoint.toBounds(8000) : null;
  const bbox = bounds ? getRoundedBbox(bounds) : "";

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
