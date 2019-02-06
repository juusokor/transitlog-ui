import {latLngBounds} from "leaflet";
import get from "lodash/get";

function calculateBoundsFromPositions(positions = []) {
  let latMin = 0;
  let lngMin = 0;
  let latMax = latMin;
  let lngMax = lngMin;

  let posIndex = 0;
  const totalPositions = positions.length;

  for (; posIndex < totalPositions; posIndex++) {
    const pos = positions[posIndex];

    latMin = latMin ? Math.min(latMin, get(pos, "[0]", 0)) : get(pos, "[0]", 0);
    lngMin = lngMin ? Math.min(lngMin, get(pos, "[1]", 0)) : get(pos, "[0]", 0);
    latMax = Math.max(latMax, get(pos, "[0]", 0));
    lngMax = Math.max(lngMax, get(pos, "[1]", 0));
  }

  return latLngBounds([[latMin, lngMin], [latMax, lngMax]]);
}

export default calculateBoundsFromPositions;
