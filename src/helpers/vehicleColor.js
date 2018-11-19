import get from "lodash/get";

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

// If there are many modes, return the most significant one. This is a placeholder
// function, to be expanded upon if logic like this is needed.
export function getPriorityMode(modes) {
  return modes[0];
}
