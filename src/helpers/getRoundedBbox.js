// Round down to three decimals
export function floor(number) {
  return Math.floor(number * 100) / 100;
}

// Round up to three decimals
export function ceil(number) {
  return Math.ceil(number * 100) / 100;
}

// Round to three decimals
export function round(number) {
  return Math.round(number * 100) / 100;
}

export function getRoundedBbox(bounds) {
  if (!bounds) {
    return "";
  }

  // Round the bounds to whole numbers
  const west = floor(bounds.getWest());
  const east = ceil(bounds.getEast());
  const north = ceil(bounds.getNorth());
  const south = floor(bounds.getSouth());

  return `${west},${south},${east},${north}`;
}
