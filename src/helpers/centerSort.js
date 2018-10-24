import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import zip from "lodash/zip";

export function centerSort(centerValue, valuesToSort) {
  const values = valuesToSort.slice();
  let firstValue = centerValue;
  let centerIndex = values.indexOf(firstValue);

  // Get a numerical time that we can diff
  let firstValueInt = parseInt(firstValue.replace(":", ""), 10);

  // If the exact value was not found in the values we want to sort,
  // we need to figure out which value would be closest to it.
  // This function deals with times or numerical values
  // only, as that's all we need for now.
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
    // Interleave the before (reversed) and after values, adn flatten the result.
    ...flatten(zip(groupedValues.after, groupedValues.before.reverse())),
  ];

  return orderedValues;
}
