import addSeconds from "date-fns/add_seconds";
import parse from "date-fns/parse";
import {getPrecisePositionForTime} from "./getPrecisePositionForTime";

const START_DATE = parse("2018-10-01T11:30:00Z");

function createPositions() {
  const positions = [];
  let positionDate = new Date(START_DATE.getTime());

  // Represent a full minute with 2 seconds intervals
  while (positions.length < 31) {
    positions.push({
      receivedAt: positionDate.toISOString(),
    });

    positionDate = addSeconds(positionDate, 2);
  }

  return positions;
}

describe("getPrecisePositionForTime", () => {
  test("Finds a position that matches the time within the tolerance.", () => {
    const queryDate = addSeconds(START_DATE, 33); // Query for the event at 11:30:33
    const foundPosition = getPrecisePositionForTime(createPositions(), queryDate, 3);

    const expected = addSeconds(START_DATE, 30).toISOString();
    expect(foundPosition.receivedAt).toBe(expected);
  });

  test("Returns null if no position is found within the tolerance.", () => {
    const queryDate = addSeconds(START_DATE, 300); // 300 is more than the maxDifference of 180
    const foundPosition = getPrecisePositionForTime(
      createPositions(),
      queryDate,
      3,
      180
    );

    expect(foundPosition).toBe(null);
  });
});
