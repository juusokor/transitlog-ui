import {getTimeRangeFromEvents} from "./getTimeRangeFromEvents";

describe("getTimeRangeFromEvents", () => {
  test("getTimeRangeFromEvents returns a range of seconds for a collection of HFP events", () => {
    // A range of one minute during the start of 01-28
    const events = [
      {
        oday: "2019-01-28",
        received_at: "2019-01-28T00:00:00.000Z", // UTC time
        tst: "2019-01-28T00:00:00.000Z", // UTC time
      },
      {
        oday: "2019-01-28",
        received_at: "2019-01-28T00:01:00.000Z", // UTC time, one minute later
        tst: "2019-01-28T00:01:00.000Z", // UTC time, one minute later
      },
    ];

    const eventsRange = getTimeRangeFromEvents(events);
    const expectMin = 0;
    const expectMax = 60;

    expect(eventsRange.min).toBe(expectMin);
    expect(eventsRange.max).toBe(expectMax);
  });

  test("getTimeRangeFromEvents handles 24h+ ranges over multiple days", () => {
    // A range of one minute during the start of 01-28
    const events = [
      {
        oday: "2019-01-28",
        received_at: "2019-01-28T00:00:00.000Z", // UTC time
        tst: "2019-01-28T00:00:00.000Z", // UTC time
      },
      {
        oday: "2019-01-28", // Same oday
        received_at: "2019-01-30T00:00:00.000Z", // UTC time, 2 days later
        tst: "2019-01-30T00:00:00.000Z", // UTC time, 2 days later
      },
    ];

    const eventsRange = getTimeRangeFromEvents(events);
    const expectMin = 0;
    const expectMax = 172800;

    expect(eventsRange.min).toBe(expectMin);
    expect(eventsRange.max).toBe(expectMax);
  });
});
