export function getTimelinessColor(timeliness, defaultColor = "", darkYellow = false) {
  return timeliness === "early"
    ? "var(--red)"
    : timeliness === "late"
    ? darkYellow
      ? "var(--dark-yellow)"
      : "var(--yellow)"
    : timeliness === "on-time"
    ? "var(--light-green)"
    : defaultColor;
}
