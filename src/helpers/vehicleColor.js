import get from "lodash/get";
import random from "lodash/random";

const vehicleColors = {
  BUS: "var(--bus-blue)",
  TRAM: "var(--green)",
  RAIL: "var(--purple)",
  TRUNK: "var(--orange)",
  SUBWAY: "var(--orange)",
  default: "var(--blue)",
};

export function getModeColor(mode = "default") {
  const color = get(vehicleColors, mode, vehicleColors.default);
  return color;
}

// If there are many modes, return the most significant one with explicit logic.
export function getPriorityMode(modes) {
  if (modes.indexOf("TRUNK") !== -1) {
    return "TRUNK";
  }

  if (modes.indexOf("TRAM") !== -1) {
    return "TRAM";
  }

  return modes[0];
}
