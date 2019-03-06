import {useState, useEffect, useRef} from "react";
import {getMomentFromDateTime} from "../helpers/time";
import moment from "moment-timezone";

// Round down to three decimals
function floor(number) {
  return Math.floor(number * 100) / 100;
}

// Round up to three decimals
function ceil(number) {
  return Math.ceil(number * 100) / 100;
}

export const useWeather = (bounds, date, time, weatherRequest) => {
  const onCancel = useRef(() => {});
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Round the bounds to whole numbers
  const west = floor(bounds.getWest());
  const east = ceil(bounds.getEast());
  const north = ceil(bounds.getNorth());
  const south = floor(bounds.getSouth());

  const bboxStr = `${west},${south},${east},${north}`;

  useEffect(() => {
    if (weatherLoading) {
      return onCancel.current;
    }

    const dateTime = moment.min(
      getMomentFromDateTime(date, time).startOf("hour"),
      moment().startOf("hour")
    );

    setWeatherLoading(true);

    weatherRequest(bboxStr, dateTime, (cancelCb) => (onCancel.current = cancelCb))
      .then((data) => {
        setWeatherData(data);
        setWeatherLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });

    return onCancel.current;
  }, [date, time, bboxStr]);

  return [weatherData, weatherLoading];
};
