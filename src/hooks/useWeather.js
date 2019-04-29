import {useState, useEffect, useRef, useMemo} from "react";
import moment from "moment-timezone";
import {getWeatherForArea} from "../helpers/getWeatherForArea";
import {getRoadConditionsForArea} from "../helpers/getRoadConditionsForArea";
import {floorMoment, ceilMoment} from "../helpers/roundMoment";
import {LatLngBounds, latLngBounds} from "leaflet";
import uniq from "lodash/uniq";
import {TIMEZONE} from "../constants";
import {useDebouncedValue} from "./useDebouncedValue";
import {getRoundedBbox} from "../helpers/getRoundedBbox";

export function getWeatherSamplePoint(location) {
  let validPoint = location || null;

  if (location instanceof LatLngBounds) {
    validPoint = location.getCenter();
  }

  return validPoint;
}

const hslBBox = getRoundedBbox(
  latLngBounds([[59.91326, 23.983637], [60.629925, 25.285678]])
).toBBoxString();

const sitesBbox = {
  "100996,100971,101004,101003,101009,151028,103943": latLngBounds([
    [60.101928, 24.826448],
    [60.277468, 25.239808],
  ]),
  "852678,874863,100976": latLngBounds([[60.091573, 24.552476], [60.354147, 24.844987]]),
  "100968": latLngBounds([[60.235056, 24.787309], [60.364335, 25.299546]]),
  "100974,100997": latLngBounds([[59.928889, 24.310777], [60.333082, 24.700791]]),
  "101029,105392": latLngBounds([[60.131948, 25.130632], [60.549869, 25.619523]]),
  "100974": latLngBounds([[59.98458, 24.09929], [60.268445, 24.364335]]),
  "103786": latLngBounds([[60.356864, 24.818208], [60.487691, 25.235688]]),
};

export function getWeatherSampleSites(point) {
  if (!point) {
    return [];
  }

  return Object.entries(sitesBbox)
    .reduce((querySites, [site, bounds]) => {
      if (bounds.contains(point)) {
        querySites = querySites.concat(site.split(","));
      }

      return querySites;
    }, [])
    .sort();
}

function getAllSites() {
  return uniq(
    Object.keys(sitesBbox).reduce(
      (allSites, site) => [...allSites, ...site.split(",")],
      []
    )
  );
}

export const useWeather = (location, time, startTime = null) => {
  // Record the fetched weather and road data
  const [weatherData, setWeatherData] = useState(null);
  const [roadData, setRoadData] = useState(null);
  const weatherLoading = useRef(false);
  const roadLoading = useRef(false);

  // Metolib cannot cache if we use a bbox, so map all locations, points or bboxes
  // supplied to this hook to sites that can be cached by metolib.
  let sites = [];

  if (Array.isArray(location)) {
    sites = location;
  } else if (location === "all" || !location) {
    sites = getAllSites();
  } else if (!!location) {
    const point = getWeatherSamplePoint(location);
    sites = getWeatherSampleSites(point);
  }

  // Debounce the values to prevent too frequent fetches
  const querySites = useDebouncedValue(sites, 5000);
  const debouncedTime = useDebouncedValue(time, 1000);
  const debouncedStartTime = useDebouncedValue(startTime, 1000);

  const [queryStartTime, queryEndTime] = useMemo(() => {
    // Get the base date that is used in the weather request. Also ensure the date
    // isn't further in the future from the real world time.
    const endDate = moment.min(
      ceilMoment(moment.tz(debouncedTime, TIMEZONE), 10, "minutes"),
      floorMoment(moment.tz(), 10, "minutes")
    );

    // Get a nice startDate by flooring the time to the nearest 10 minute mark.
    const startDate = floorMoment(
      queryStartTime
        ? moment.tz(queryStartTime, TIMEZONE)
        : endDate.clone().subtract(10, "minutes"),
      10,
      "minutes"
    );

    return [startDate.toDate(), endDate.toDate()];
  }, [debouncedTime, debouncedStartTime]);

  useEffect(() => {
    // Bail directly if it is loading or we don't have all the data we need yet.
    if (weatherLoading.current || !querySites || !queryStartTime || !queryEndTime) {
      return () => {};
    }

    // If we got to here, a new weather request will be made.
    weatherLoading.current = true;

    // Start the requests. Each promise returns an object containing
    // the data and request namespace.
    const weatherPromise = getWeatherForArea(querySites, queryStartTime, queryEndTime)
      .then((data) => setWeatherData(data))
      .catch((err) => console.error(err))
      .finally(() => {
        weatherLoading.current = false;
      });

    return () => {
      if (typeof weatherPromise.cancel === "function") {
        weatherPromise.cancel();
      }
    }; // The effect will cancel the connections if refreshed (or unmounted).
  }, [queryStartTime, queryEndTime, querySites]); // Only refresh the effect if these props change.

  useEffect(() => {
    // Bail directly if it is loading or we don't have all the data we need yet.
    if (roadLoading.current || !queryStartTime || !queryEndTime) {
      return () => {};
    }

    // If we got to here, a new weather request will be made.
    roadLoading.current = true;

    const roadConditionPromise = getRoadConditionsForArea(
      hslBBox,
      queryStartTime,
      queryEndTime
    )
      .then((data) => setRoadData(data))
      .catch((err) => console.error(err))
      .finally(() => {
        roadLoading.current = false;
      });

    return () => {
      if (typeof roadConditionPromise.cancel === "function") {
        roadConditionPromise.cancel();
      }
    }; // The effect will cancel the connections if refreshed (or unmounted).
  }, [queryStartTime, queryEndTime]);

  const combinedData = {
    weather: weatherData,
    roadCondition: roadData,
  };

  return [combinedData];
};
