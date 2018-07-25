import get from "lodash/get";
import set from "lodash/set";
import random from "lodash/random";

const vehicleColors = {};

export function getColor(name) {
  const color = get(vehicleColors, name);

  if (!color) {
    return setColor(name);
  }

  return color;
}

export function createColor() {
  return `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
}

export function setColor(name, color = createColor()) {
  set(vehicleColors, name, color);
  return get(vehicleColors, name);
}
