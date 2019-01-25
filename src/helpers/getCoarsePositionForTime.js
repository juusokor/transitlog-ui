import startOfDay from "date-fns/start_of_day";
import diffSeconds from "date-fns/difference_in_seconds";

// This function is not as precise as the ones used
// for the HFP markers. But it is a lot cheaper and more performant!
function getCoarsePositionForTime(positions = [], time) {
  const firstPositionTime = new Date(positions[0].received_at);
  const lastPositionTime = new Date(positions[positions.length - 1].received_at);
  const dayStart = startOfDay(firstPositionTime);
  const positionsTimeStart = diffSeconds(firstPositionTime, dayStart);
  const positionsTimeEnd = diffSeconds(lastPositionTime, dayStart);

  if (time <= positionsTimeStart || time >= positionsTimeEnd) {
    return null;
  }

  let nextPosition = null;

  for (const position of positions) {
    const positionTime = new Date(position.received_at);
    const diffFromStart = diffSeconds(positionTime, dayStart);

    if (diffFromStart === time) {
      nextPosition = position;
      break;
    }
  }

  return nextPosition;
}

export default getCoarsePositionForTime;
