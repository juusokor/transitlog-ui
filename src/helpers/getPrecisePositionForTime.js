import diffDates from "date-fns/difference_in_seconds";

export function getPrecisePositionForTime(
  positions,
  time,
  tolerance = 3,
  maxDifference = 180
) {
  let nextHfpPosition = null;
  const total = positions.length;
  let posIdx = 0;

  for (; posIdx < total; posIdx++) {
    const position = positions[posIdx];
    // This acts as the upper limit for when a time matches a marker.
    // If it is too low, markers for selected journeys might not match.
    let prevDifference = maxDifference;

    if (nextHfpPosition) {
      const nextHfpDate = new Date(nextHfpPosition.received_at);
      const diff = Math.abs(diffDates(time, nextHfpDate));
      prevDifference = diff < prevDifference ? diff : prevDifference;

      // A diff of 3 seconds is "good enough" and will break the loop.
      // Increase this number to get faster but less precise performance. Do not
      // decrease below the time resolution of the HFP data the app uses (as of writing 2 seconds).
      if (prevDifference <= tolerance) {
        break;
      }
    }

    const difference = Math.abs(diffDates(time, new Date(position.received_at)));

    if (difference < prevDifference) {
      nextHfpPosition = position;
    }
  }

  return nextHfpPosition;
}
