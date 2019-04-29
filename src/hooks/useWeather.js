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
    bounds = point.pad(0.1);
  } else {
    // Convert the point to a bounds of 8 square kilometers.
    bounds = validPoint ? validPoint.toBounds(8000) : null;
  }

  // Round the bounds to two decimals
  return getRoundedBbox(bounds);
}

export const useWeather = (location, dateTime) => {
  // Record the fetched weather and road data
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const prevBbox = useRef(null);

  // Collect cancellation callbacks and use one function to run them all.
  const cancelCallbacks = useRef([]);
  const onCancel = useCallback(() => {
    cancelCallbacks.current.forEach((cb) => cb());
    setWeatherLoading(false);
  }, [cancelCallbacks.current]);

  // Convert the point (or a bounds) to a good sample area with common logic.
  // Also rounds the bounds to prevent small changes from triggering refetches.
  const roundedBounds = getWeatherSampleBounds(location);
  let bboxStr = "";

  // This condition checks if the center of the current bbox is more than 8 km from
  // the center of the last bbox. This way the updates do not fire too often for small distances.
  if (
    (!prevBbox.current && roundedBounds) ||
    (prevBbox.current &&
      roundedBounds &&
      roundedBounds.getCenter().distanceTo(prevBbox.current.getCenter()) >= 8000)
  ) {
    prevBbox.current = roundedBounds;
    bboxStr = roundedBounds.toBBoxString();
  } else if (prevBbox.current) {
    bboxStr = prevBbox.current.toBBoxString();
  }

  // The weather requests want a bbox string.
  const queryBbox = useDebouncedValue(bboxStr, 2000);
  const queryTime = useDebouncedValue(dateTime, 2000);

  useEffect(() => {
    // Bail directly if it is loading or we don't have all the data we need yet.
    if (weatherLoading || !queryBbox || !queryTime) {
      return onCancel;
    }

    let isCancelled = false;
    // If we got to here, a new weather request will be made.
    setWeatherLoading(true);

    // Clear the stale cancel callbacks.
    cancelCallbacks.current = [];

    // Get the base date that is used in the weather request. Also ensure the date
    // isn't further in the future from the real world time.
    const endDate = moment.min(
      ceilMoment(moment.tz(queryTime, TIMEZONE), 10, "minutes"),
      floorMoment(moment.tz(), 10, "minutes")
    );

    // Since we're requesting historical data, the startDate is the furthest in the past
    // and the endDate is in the future from that.

    // Get a nice startDate by flooring the time to the nearest 10 minute mark.
    const weatherStartDate = floorMoment(
      endDate.clone().subtract(10, "minutes"),
      10,
      "minutes"
    );

    // The road dates are slightly different since we want a longer time range.
    // Combined with the road end date, it will be a range of an hour.
    const roadStartDate = endDate
      .clone()
      .subtract(30, "minutes")
      .startOf("hour");

    const weatherEnd = endDate.toDate();
    const weatherStart = weatherStartDate.toDate();

    const roadEnd = endDate.endOf("hour").toDate();
    const roadStart = roadStartDate.toDate();

    // Start the requests. Each promise returns an object containing
    // the data and request namespace.
    const weatherPromise = getWeatherForArea(
      queryBbox,
      weatherStart,
      weatherEnd,
      (cancelCb) => cancelCallbacks.current.push(cancelCb)
    ).then((data) => ({weather: data})); // namespace under "weather"

    const roadConditionPromise = getRoadConditionsForArea(
      queryBbox,
      roadStart,
      roadEnd,
      (cancelCb) => cancelCallbacks.current.push(cancelCb)
    ).then((data) => ({roadCondition: data})); // namespace under "roadCondition"

    // Await all promises, merge the results and replace the weather data state.
    Promise.all([weatherPromise, roadConditionPromise])
      .then((allData) => {
        if (!isCancelled) {
          setWeatherData(merge(...allData));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setWeatherLoading(false);
      });

    return () => {
      isCancelled = true;
      onCancel();
    }; // The effect will cancel the connections if refreshed (or unmounted).
  }, [queryTime, queryBbox]); // Only refresh the effect if these props change.

  return [weatherData, weatherLoading];
};
