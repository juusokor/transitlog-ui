function getDelayType(delay) {
  if (!delay && delay !== 0) {
    // Return empty string if falsy but not zero, which is a valid value.
    return "";
  }

  return delay <= -10 ? "early" : delay >= 60 * 3 ? "late" : "on-time";
}

export default getDelayType;
