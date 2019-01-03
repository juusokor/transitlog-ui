import {latLngBounds, latLng} from "leaflet";

export function boundsFromBBoxString(bboxString) {
  const [west, south, east, north] = bboxString.split(",").map(parseFloat);

  console.log(west);

  return latLngBounds(latLng(south, west), latLng(north, east));
}
