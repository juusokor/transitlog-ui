function getDelayType(delay) {
  return delay >= 60 ? "early" : delay <= -60 * 3 ? "late" : "on-time";
}

export default getDelayType;
