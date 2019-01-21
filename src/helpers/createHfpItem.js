import moment from "moment-timezone";

// Add props to or modify the HFP item.
export function createHfpItem(rawHfp) {
  const received_at_unix = moment.tz(rawHfp.received_at, "Europe/Helsinki").unix();

  return {
    ...rawHfp,
    received_at_unix,
  };
}
