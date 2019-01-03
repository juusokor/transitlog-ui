import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import zip from "lodash/zip";
import get from "lodash/get";

/*
  This function sorts an array of timestrings (like 12:30:20) so that the centerValue
  is first, followed by the next value from the centerValue in ascending order,
  followed by the value preceding centerValue and so on. The array is essentially
  centered around the centerValue. Example:
  
  centerValue: 5
  valuesToSort: [1, 3, 5, 7, 10]
  result: [5, 7, 3, 10, 1]
 */

export function centerSort(centerValue, valuesToSort = []) {
  if (valuesToSort.length === 0) {
    return [];
  }

  const values = valuesToSort.slice();
  let firstValue = centerValue;
  let centerIndex = values.indexOf(firstValue);

  // Get a numerical time that we can diff
  let firstValueInt =
    typeof firstValue === "string"
      ? parseInt(firstValue.replace(":", ""), 10)
      : firstValue;

  // If the exact centerValue was not found in the values we want to sort,
  // we need to figure out which value would be closest to it.
  // This function deals with times or numerical values
  // only, as that's all we need for now.
  if (centerIndex === -1) {
    let prevDifference = false;

    centerIndex = values.reduce((prevIndex, candidate, index) => {
      const candidateVal =
        typeof candidate === "string"
          ? parseInt(candidate.replace(":", ""), 10)
          : candidate;

      const diff = Math.abs(firstValueInt - candidateVal);

      if (prevDifference === false || diff < prevDifference) {
        prevDifference = diff;
        return index;
      }

      return prevIndex;
    }, 0);
  }

  if (centerIndex > 0) {
    // Assign firstValue to a string that definitely is in the array.
    // It will be inserted as the first element after sorting.
    firstValue = values.splice(centerIndex, 1)[0];
  } else {
    // If the centerIndex wasn't found (or if it was the first element),
    // assign it as the firstValue. Will be inserted after sorting.
    firstValue = values.shift();
  }

  firstValueInt = parseInt(firstValue.replace(":", ""), 10);

  const groupedValues = groupBy(values, (timeValue) => {
    const diff = parseInt(timeValue.replace(":", ""), 10) - firstValueInt;
    return diff > 0 ? "after" : "before";
  });

  const orderedValues = [
    firstValue,
    // Interleave the before (reversed) and after values, and flatten the result.
    ...flatten(
      zip(
        get(groupedValues, "after", []),
        get(groupedValues, "before", []).reverse()
      )
    ),
  ];

  return orderedValues;
}
