export function isBefore(value, otherValue) {
  const checkVal =
    typeof value === "string" ? parseInt(value.replace(/\-/g, ""), 10) : value;
  const otherVal =
    typeof otherValue === "string"
      ? parseInt(otherValue.replace(/\-/g, ""), 10)
      : otherValue;

  return checkVal <= otherVal;
}

export function isAfter(value, otherValue) {
  const checkVal =
    typeof value === "string" ? parseInt(value.replace(/\-/g, ""), 10) : value;
  const otherVal =
    typeof otherValue === "string"
      ? parseInt(otherValue.replace(/\-/g, ""), 10)
      : otherValue;

  return checkVal >= otherVal;
}

export function isWithinRange(value, rangeStart, rangeEnd) {
  const checkVal =
    typeof value === "string" ? parseInt(value.replace(/\-/g, ""), 10) : value;
  const startVal =
    typeof rangeStart === "string"
      ? parseInt(rangeStart.replace(/\-/g, ""), 10)
      : rangeStart;
  const endVal =
    typeof rangeEnd === "string"
      ? parseInt(rangeEnd.replace(/\-/g, ""), 10)
      : rangeEnd;

  return isAfter(checkVal, startVal) && isBefore(checkVal, endVal);
}
