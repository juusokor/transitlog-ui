import moment from "moment-timezone";
import {journeyStartTime} from "./time";
import {TIMEZONE} from "../constants";

// Add props to or modify the HFP item.
export function createHfpItem(rawHfp, startMoment = null) {
  const journeyStartMoment =
    startMoment && startMoment instanceof moment
      ? startMoment
      : moment.tz(rawHfp.tst, TIMEZONE);

  const journey_start_time = journeyStartTime(rawHfp, journeyStartMoment);

  return {
    ...rawHfp,
    journey_start_time,
    received_at_unix: parseInt(rawHfp.tsi, 10),
  };
}
