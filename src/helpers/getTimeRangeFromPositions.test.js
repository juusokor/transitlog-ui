import {getTimeRangeFromPositions} from "./getTimeRangeFromPositions";

describe("getTimeRangeFromPositions", () => {
  test("getTimeRangeFromPositions returns a range of seconds for a collection of HFP events", () => {
    // A range of one minute during the start of 01-28
    const events = [
      {
        oday: "2019-01-28",
        received_at: "2019-01-27T22:00:00.000Z", // UTC time
      },
      {
        oday: "2019-01-28",
        received_at: "2019-01-27T22:01:00.000Z", // UTC time, one minute later
      },
    ];

    const eventsRange = getTimeRangeFromPositions(events);
    const expectMin = 0;
    const expectMax = 60;

    expect(eventsRange.min).toBe(expectMin);
    expect(eventsRange.max).toBe(expectMax);
  });

  test("getTimeRangeFromPositions handles 24h+ ranges over multiple days", () => {
    // A range of one minute during the start of 01-28
    const events = [
      {
        oday: "2019-01-28",
        received_at: "2019-01-27T22:00:00.000Z", // UTC time
      },
      {
        oday: "2019-01-28", // Same oday
        received_at: "2019-01-29T22:00:00.000Z", // UTC time, 2 days later
      },
    ];

    const eventsRange = getTimeRangeFromPositions(events);
    const expectMin = 0;
    const expectMax = 172800;

    expect(eventsRange.min).toBe(expectMin);
    expect(eventsRange.max).toBe(expectMax);
  });
});
