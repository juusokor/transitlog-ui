export function removeInitialZero(str) {
  return str.replace(/^0+/, "");
}

export function sortByOperationDay(time) {
  // Take care of edge cases where the initial zero might cause problems
  const timeIntVal = parseInt(removeInitialZero(time).replace(":", ""));

  // And the edge case of 00:00 (parsed to integer 0)
  if (timeIntVal === 0) {
    return 2400;
  }

  // Give times before 04:30 a LOT more weight so they come last in the list.
  if (timeIntVal < 430) {
    return timeIntVal + 10000;
  }

  return timeIntVal;
}
