import {useState, useEffect} from "react";
import {getMomentFromDateTime} from "../helpers/time";
import {getWeatherForArea} from "../helpers/getWeatherForArea";

// Round down to three decimals
function floor(number) {
  return Math.floor(number * 1000) / 1000;
}

// Round up to three decimals
function ceil(number) {
  return Math.ceil(number * 1000) / 1000;
}

export const useWeather = (bounds, date, time) => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Round the bounds to whole numbers
  const west = floor(bounds.getWest());
  const east = ceil(bounds.getEast());
  const north = ceil(bounds.getNorth());
  const south = floor(bounds.getSouth());

  const dateTime = getMomentFromDateTime(date, time).startOf("hour");
  const bboxStr = `${west},${south},${east},${north}`;

  useEffect(() => {
    if (weatherLoading) {
      return;
    }

    setWeatherLoading(true);

    getWeatherForArea(bboxStr, dateTime)
      .then((data) => {
        setWeatherData(data);
        setWeatherLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [dateTime.toISOString(true), bboxStr]);

  return [weatherData, weatherLoading];
};
