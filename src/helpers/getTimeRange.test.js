import {getTimeRange} from "./getTimeRange";
import {createDateTime} from "./createDateTime";
import addMinutes from "date-fns/add_minutes";

describe("getTimeRange", () => {
  test("Returns the same range of 15 minutes for any date within the same 15 minutes", () => {
    const date = "2018-10-04";
    const minTime = "12:00:00";

    // The range is min = 12:00 and max = 12:15
    let time = minTime;

    let range = getTimeRange(date, time);
    const expected = createDateTime(date, minTime);

    expect(range.min.toString()).toBe(expected.toString());
    expect(range.max.toString()).toBe(addMinutes(expected, 15).toString());

    // The range is still min = 12:00 and max = 12:15
    time = "12:12:00";
    range = getTimeRange(date, time);

    expect(range.min.toString()).toBe(expected.toString());
    expect(range.max.toString()).toBe(addMinutes(expected, 15).toString());

    // The range is min = 12:15 and max = 12:30
    time = "12:17:00";
    range = getTimeRange(date, time);

    const nextQuarterExpected = addMinutes(expected, 15);

    expect(range.min.toString()).toBe(nextQuarterExpected.toString());
    expect(range.max.toString()).toBe(
      addMinutes(nextQuarterExpected, 15).toString()
    );
  });

  test("Seconds are always reset in the time range", () => {
    const date = "2018-10-04";
    const time = "12:13:14"; // Time with seconds

    let range = getTimeRange(date, time);

    expect(range.min.getSeconds()).toBe(0);
    expect(range.max.getSeconds()).toBe(0);
  });

  test("The hour of the max date in the range is correct for a range of the last quarter of an hour.", () => {
    const date = "2018-10-04";
    const time = "12:49:00";

    // Should result in a range with min = 12:45 and max = 13:00
    let range = getTimeRange(date, time);

    expect(range.min.getMinutes()).toBe(45);
    expect(range.max.getHours()).toBe(13); // Hour is bumped from 12 to 13
  });
});
