import moment from "moment-timezone";
import {journeyStartTime} from "./time";

// Add props to or modify the HFP item.
export function createHfpItem(rawHfp, startMoment = null) {
  const received_at_moment = moment.tz(rawHfp.received_at, "Europe/Helsinki");
  const journeyStartMoment =
    startMoment && startMoment instanceof moment ? startMoment : received_at_moment;
  const journey_start_time = journeyStartTime(rawHfp, journeyStartMoment);

  return {
    ...rawHfp,
    journey_start_time,
    received_at_unix: received_at_moment.unix(),
  };
}
