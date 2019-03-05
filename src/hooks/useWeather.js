import {useState, useRef, useEffect, useMemo} from "react";
import {getMomentFromDateTime} from "../helpers/time";
import {latLngBounds} from "leaflet";
import Metolib from "@fmidev/metolib";
import {FMI_APIKEY} from "../constants";

const SERVER_URL = `https://data.fmi.fi/fmi-apikey/${FMI_APIKEY}/wfs`;
const STORED_QUERY_OBSERVATION = "fmi::observations::weather::multipointcoverage";

// TODO: Figure out why this goes into a loop

export const useWeather = (bounds, date, time) => {
  const prevBounds = useRef(null);
  const prevStartTime = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Round the bounds to whole numbers
  const west = Math.floor(bounds.getWest());
  const east = Math.ceil(bounds.getEast());
  const north = Math.ceil(bounds.getNorth());
  const south = Math.floor(bounds.getSouth());

  const roundedBounds = latLngBounds([south, west], [north, east]);

  const dateTime = getMomentFromDateTime(date, time).startOf("hour");
  const startTime = dateTime.toDate();
  const endTime = dateTime.add(1, "hour").toDate();
  const bboxStr = `${west},${south},${east},${north}`;

  const canFetch = useMemo(() => {
    if (weatherLoading) {
      return false;
    }

    const boundsChanged =
      !prevBounds.current ||
      (prevBounds.current &&
        (!prevBounds.current.equals(roundedBounds) &&
          !prevBounds.current.contains(roundedBounds)));

    const timeChanged =
      !prevStartTime.current ||
      (prevStartTime.current && prevStartTime.current !== startTime);

    if (weatherData && !weatherLoading && !boundsChanged && !timeChanged) {
      return false;
    }

    return true;
  }, [
    weatherData,
    weatherLoading,
    prevBounds.current,
    prevStartTime.current,
    roundedBounds,
    startTime,
  ]);

  useEffect(() => {
    if (!canFetch) {
      return;
    }

    prevBounds.current = roundedBounds;
    prevStartTime.current = startTime;

    const connection = new Metolib.WfsConnection();
    if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
      setWeatherLoading(true);

      connection.getData({
        requestParameter: "td",
        begin: startTime,
        end: endTime,
        timestep: 60 * 60 * 1000,
        bbox: bboxStr,
        sites: ["Helsinki"],
        callback: function(data) {
          connection.disconnect();
          setWeatherData(data);
          setWeatherLoading(false);
        },
      });
    }
  }, [canFetch, startTime, endTime, bboxStr]);

  return [weatherData, weatherLoading];
};
