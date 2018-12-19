export function applyTimeOffset(plannedTime, observedTime, offsetMinutes) {
  const offsetTime = plannedTime.clone().subtract(offsetMinutes, "minutes");
  const diff = plannedTime.diff(observedTime, "seconds");
  const sign = diff < 0 ? "+" : diff > 0 ? "-" : "";
  const diffSeconds = Math.abs(diff) % 60;
  const diffMinutes = Math.floor(Math.abs(diff) / 60);

  return {
    offsetTime,
    diff,
    sign,
    diffSeconds,
    diffMinutes,
  };
}
