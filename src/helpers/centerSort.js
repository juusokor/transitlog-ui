import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import zip from "lodash/zip";

export function centerSort(centerValue, valuesToSort) {
  const values = valuesToSort.slice();
  let firstValue = centerValue;
  let centerIndex = values.indexOf(firstValue);

  let firstValueInt = parseInt(firstValue.replace(":", ""), 10);

  // If the exact time was not found in the times we want to fetch,
  // we need to figure out which time would be closest to it.
  if (centerIndex === -1) {
    let prevDifference = false;

    centerIndex = values.reduce((prevIndex, candidate, index) => {
      const diff = Math.abs(
        firstValueInt - parseInt(candidate.replace(":", ""), 10)
      );

      if (prevDifference === false || diff < prevDifference) {
        prevDifference = diff;
        return index;
      }

      return prevIndex;
    }, 0);
  }

  if (centerIndex > 0) {
    // Assign the firstValue to a string that definitely is in the array
    firstValue = values.splice(centerIndex, 1)[0];
    // Move the first time to the beginning of the array
  } else {
    // If the centerIndex wasn't found (or if it was the first element),
    // assign it as the firstValue.
    firstValue = values.shift();
  }

  firstValueInt = parseInt(firstValue.replace(":", ""), 10);

  const groupedValues = groupBy(values, (timeValue) => {
    const diff = parseInt(timeValue.replace(":", ""), 10) - firstValueInt;
    return diff > 0 ? "after" : "before";
  });

  const orderedValues = [
    firstValue,
    ...flatten(zip(groupedValues.after, groupedValues.before.reverse())),
  ];

  return orderedValues;
}
