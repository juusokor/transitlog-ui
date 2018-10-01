import diffDates from "date-fns/difference_in_seconds";

// getJourneyFollowBounds caches the previously matched index so that
// consecutive lookups will be much faster. It saves around 3 ms.
// Since this is outside a component we also need to save a ref
// to the journey that was searched through.
let prevPosition = {
  key: "",
  posIndex: 0,
};

const TOLERANCE = 15; // Tolerate 15 seconds off from time

// This function is not as precise as the ones used
// for the HFP markers and stop drive-by times. But
// it is a lot cheaper and more performant!
function getCoarsePositionForTime(positions, time, cacheKey, tolerance = TOLERANCE) {
  let followPosition = null;

  const prevPosIdx = prevPosition.key === cacheKey ? prevPosition.posIndex : 0;

  for (let posIdx = prevPosIdx; posIdx < positions.length; posIdx++) {
    const pos = positions[posIdx];

    if (pos && Math.abs(diffDates(new Date(pos.receivedAt), time)) <= tolerance) {
      followPosition = pos;
      prevPosition = {
        key: cacheKey,
        posIndex: posIdx,
      };

      break;
    }
  }

  if (!followPosition) {
    prevPosition = {
      key: "",
      posIndex: 0,
    };
  }

  return followPosition;
}

export default getCoarsePositionForTime;
