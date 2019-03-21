import {useState, useEffect, useRef, useCallback} from "react";
import moment from "moment-timezone";
import {getWeatherForArea} from "../helpers/getWeatherForArea";
import {getRoadConditionsForArea} from "../helpers/getRoadConditionsForArea";
import merge from "lodash/merge";
import {floorMoment, ceilMoment} from "../helpers/roundMoment";
import {getRoundedBbox} from "../helpers/getRoundedBbox";
import {LatLngBounds} from "leaflet";
import {TIMEZONE} from "../constants";
import {useDebouncedValue} from "./useDebouncedValue";

export function getWeatherSampleBounds(point) {
  let validPoint = point || null;
  let bounds = null;

  if (point instanceof LatLngBounds) {
    // If this is a bounds, get the center point as we want to always
    // have a standard-sized area.
    bounds = point.pad(0.1);
  } else {
    // Convert the point to a bounds of 8 square kilometers.
    bounds = validPoint ? validPoint.toBounds(8000) : null;
  }

  // Round the bounds to two decimals
  return getRoundedBbox(bounds);
}

export const useWeather = (point, date, startDate = null) => {
  // Collect cancellation callbacks and use one function to run them all.
  const cancelCallbacks = useRef([]);
  const onCancel = useCallback(() => {
    cancelCallbacks.current.forEach((cb) => cb());
  }, [cancelCallbacks.current]);

  // Record the fetched weather and road data
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Convert the point (or a bounds) to a good sample area with common logic.
  // Also rounds the bounds to prevent small changes from triggering refetches.
  const roundedBounds = getWeatherSampleBounds(point);

  // The weather requests want a bbox string.
  const bboxStr = roundedBounds ? roundedBounds.toBBoxString() : "";
  const bbox = useDebouncedValue(bboxStr, 1000);

  useEffect(() => {
    // Bail directly if it is loading or we don't have all the data we need yet.
    if (weatherLoading || !bbox || !date) {
      return onCancel;
    }

    let isCancelled = false;
    // If we got to here, a new weather request will be made.
    setWeatherLoading(true);

    // Clear the stale cancel callbacks.
    cancelCallbacks.current = [];

    // Get the base date that is used in the weather request. If a startDate arg is
    // provided to this hook, that will be used as the startDate and this will be
    // used as the endDate. If no startDate is provided, a startDate will be created
    // based on this and this will be used as the endDate. Also ensure the date
    // isn't further in the future from the real world time.
    const dateTime = moment.min(
      ceilMoment(moment.tz(date, TIMEZONE), 10, "minutes"),
      floorMoment(moment.tz(), 10, "minutes")
    );

    // Since we're requesting historical data, the startDate is the furthest in the past
    // and the endDate is in the future from that.

    // Get a nice startDate, either from a provided startDate arg or calculated from
    // the base date. Calculated date results in a range of 30 minutes.
    const weatherStartDate = !startDate
      ? dateTime.clone().subtract(30, "minutes")
      : floorMoment(moment.tz(startDate, TIMEZONE), 10, "minutes");

    // The road dates are slightly different since we want a longer time range.
    // The provided startDate is also used here.
    const roadStartDate = !startDate
      ? dateTime
          .clone()
          .startOf("hour")
          .subtract(1, "hour")
      : moment.tz(startDate, TIMEZONE).startOf("hour");

    const weatherEnd = dateTime.toDate();
    const weatherStart = weatherStartDate.toDate();

    const roadEnd = dateTime.endOf("hour").toDate();
    const roadStart = roadStartDate.toDate();

    // Start the requests. Each promise returns an object containing
    // the data and request namespace.
    const weatherPromise = getWeatherForArea(bbox, weatherStart, weatherEnd, (cancelCb) =>
      cancelCallbacks.current.push(cancelCb)
    ).then((data) => ({weather: data})); // namespace under "weather"

    const roadConditionPromise = getRoadConditionsForArea(
      bbox,
      roadStart,
      roadEnd,
      (cancelCb) => cancelCallbacks.current.push(cancelCb)
    ).then((data) => ({roadCondition: data})); // namespace under "roadCondition"

    // Await all promises, merge the results and replace the weather data state.
    Promise.all([weatherPromise, roadConditionPromise])
      .then((allData) => {
        if (!isCancelled) {
          setWeatherData(merge(...allData));
          setWeatherLoading(false);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      isCancelled = true;
      onCancel();
    }; // The effect will cancel the connections if refreshed (or unmounted).
  }, [date, startDate, bbox]); // Only refresh the effect if these props change.

  return [weatherData, weatherLoading];
};
