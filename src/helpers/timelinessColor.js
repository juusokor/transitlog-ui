export function getTimelinessColor(timeliness, defaultColor = "") {
  return timeliness === "early"
    ? "var(--red)"
    : timeliness === "late"
      ? "var(--yellow)"
      : timeliness === "on-time"
        ? "var(--light-green)"
        : defaultColor;
}
