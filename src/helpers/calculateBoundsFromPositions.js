import {latLngBounds} from "leaflet";

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

    latMin = Math.min(latMin, pos.lat);
    lngMin = Math.min(lngMin, pos.lon);
    latMax = Math.max(latMax, pos.lat);
    lngMax = Math.max(lngMax, pos.lon);
  }

  return latLngBounds([[latMin, lngMin], [latMax, lngMax]]);
}

export default calculateBoundsFromPositions;
