import {combineDateAndTime} from "./time";
import moment from "moment-timezone";

// Add props to or modify the HFP item.
export function createHfpItem(rawHfp) {
  const journeyStartMoment = combineDateAndTime(
    rawHfp.oday,
    rawHfp.journey_start_time,
    "Europe/Helsinki"
  );

  return {
    ...rawHfp,
    received_at_unix: moment.tz(rawHfp.received_at, "Europe/Helsinki").unix(),
    journey_start_timestamp: journeyStartMoment.toISOString(),
  };
}
