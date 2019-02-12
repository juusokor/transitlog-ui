import moment from "moment-timezone";
import {journeyStartTime} from "./time";
import {TIMEZONE} from "../constants";

// Add props to or modify the HFP item.
export function createHfpItem(rawHfp, startMoment = null) {
  const received_at_moment = moment.tz(rawHfp.tst, TIMEZONE);
  const journeyStartMoment =
    startMoment && startMoment instanceof moment ? startMoment : received_at_moment;
  const journey_start_time = journeyStartTime(rawHfp, journeyStartMoment);

  return {
    ...rawHfp,
    received_at: rawHfp.tst,
    journey_start_time,
    received_at_unix: received_at_moment.unix(),
  };
}
