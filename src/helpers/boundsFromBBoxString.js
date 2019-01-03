import {latLngBounds} from "leaflet";

export function boundsFromBBoxString(bboxString) {
  const bboxParts = bboxString.split(",");

  if (bboxParts.length === 0) {
    return false;
  }

  return latLngBounds([bboxParts[1], bboxParts[0]], [bboxParts[3], bboxParts[2]]);
}
