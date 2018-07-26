import {latLngBounds} from "leaflet";
import get from "lodash/get";

function calculateBoundsFromPositions(
  positions,
  defaultPosition = {lat: 0, lng: 0}
) {
  let latMin = defaultPosition.lat;
  let lngMin = defaultPosition.lng;
  let latMax = latMin;
  let lngMax = lngMin;

  let posIndex = 0;
  const totalPositions = positions.length;

  for (; posIndex < totalPositions; posIndex++) {
    const pos = positions[posIndex];

    latMin = Math.min(latMin, get(pos, "lat", 0));
    lngMin = Math.min(lngMin, get(pos, "lon", 0));
    latMax = Math.max(latMax, get(pos, "lat", 0));
    lngMax = Math.max(lngMax, get(pos, "lon", 0));
  }

  return latLngBounds([[latMin, lngMin], [latMax, lngMax]]);
}

export default calculateBoundsFromPositions;
