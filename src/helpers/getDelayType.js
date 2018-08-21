function getDelayType(delay) {
  return delay >= 10 ? "early" : delay <= -60 * 3 ? "late" : "on-time";
}

export default getDelayType;
