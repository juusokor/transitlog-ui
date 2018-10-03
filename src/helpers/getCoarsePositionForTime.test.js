import getCoarsePositionForTime from "./getCoarsePositionForTime";
import addSeconds from "date-fns/add_seconds";
import parse from "date-fns/parse";

const START_DATE = parse("2018-10-01T11:30:00Z");

function createPositions() {
  const positions = [];
  let positionDate = new Date(START_DATE.getTime());

  // Represent a full minute with 5 seconds intervals
  while (positions.length < 13) {
    positions.push({
      received_at: positionDate.toISOString(),
    });

    positionDate = addSeconds(positionDate, 5);
  }

  return positions;
}

describe("getCoarsePositionForTime", () => {
  test("Finds a position that matches the time within the tolerance.", () => {
    const queryDate = addSeconds(START_DATE, 30); // Query for the event at 11:30:30
    const foundPosition = getCoarsePositionForTime(
      createPositions(),
      queryDate,
      "test",
      15 // Tolerance
    );

    // With a tolerance of 15, 11:30:15 should be returned as close enough.
    const expected = addSeconds(START_DATE, 15).toISOString();
    expect(foundPosition.received_at).toBe(expected);
  });

  test("Returns null if no position is found within the tolerance.", () => {
    const queryDate = addSeconds(START_DATE, 120); // Query for the event at 11:32:00
    const foundPosition = getCoarsePositionForTime(
      createPositions(),
      queryDate,
      "test",
      15 // Tolerance
    );

    // With a tolerance of 15, no position should match 11:32:00
    expect(foundPosition).toBe(null);
  });
});
