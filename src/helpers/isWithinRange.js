export function intval(val) {
  return typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
}

export function isBefore(value, otherValue) {
  const checkVal = intval(value);
  const otherVal = intval(otherValue);
  return checkVal <= otherVal;
}

export function isAfter(value, otherValue) {
  const checkVal = intval(value);
  const otherVal = intval(otherValue);
  return checkVal >= otherVal;
}

export function isWithinRange(value, rangeStart, rangeEnd) {
  const checkVal = intval(value);
  const startVal = intval(rangeStart);
  const endVal = intval(rangeEnd);

  return isAfter(checkVal, startVal) && isBefore(checkVal, endVal);
}
