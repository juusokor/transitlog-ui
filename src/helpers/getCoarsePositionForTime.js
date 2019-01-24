import startOfDay from "date-fns/start_of_day";
import diffSeconds from "date-fns/difference_in_seconds";
import nth from "lodash/nth";

// This function is not as precise as the ones used
// for the HFP markers. But it is a lot cheaper and more performant!
function getCoarsePositionForTime(positions = [], time) {
  const firstPositionTime = new Date(positions[0].received_at);
  const lastPositionTime = new Date(positions[positions.length - 1].received_at);
  const dayStart = startOfDay(firstPositionTime);
  const positionsTimeStart = diffSeconds(firstPositionTime, dayStart);
  const positionsTimeEnd = diffSeconds(lastPositionTime, dayStart);

  if (time < positionsTimeStart || time > positionsTimeEnd) {
    return null;
  }

  const positionsRange = positionsTimeEnd - positionsTimeStart;
  const timePosition = time - positionsTimeStart;

  const diff = positionsRange - timePosition;
  const avg = (positionsRange + timePosition) / 2;

  const currentProgress = diff / avg;
  const positionsIndex = -1 * Math.floor(positions.length * currentProgress);

  return nth(positions, positionsIndex);
}

export default getCoarsePositionForTime;
