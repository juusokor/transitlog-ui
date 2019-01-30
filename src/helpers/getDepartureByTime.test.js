import {getDepartureByTime} from "./getDepartureByTime";

describe("getDepartureByTime", () => {
  test("returns a departure that matches the provided time", () => {
    const departures = [
      {hours: 13, minutes: 5},
      {hours: 13, minutes: 45},
      {hours: 8, minutes: 18},
      {hours: 8, minutes: 55},
      {hours: 23, minutes: 42},
      {hours: 23, minutes: 9},
      {hours: 2, minutes: 1, isNextDay: true},
      {hours: 2, minutes: 42, isNextDay: true},
      {hours: 0, minutes: 20, isNextDay: true},
      {hours: 0, minutes: 36, isNextDay: true},
    ];

    const time1 = "13:10:00";
    const departure1 = getDepartureByTime(departures, time1);

    const time2 = "09:33:00";
    const departure2 = getDepartureByTime(departures, time2);

    const time3 = "26:15:00"; // Supports 24h+ times
    const departure3 = getDepartureByTime(departures, time3);

    expect(departure1).toBe(departures[0]);
    expect(departure2).toBeNull();
    expect(departure3).toBe(departures[6]);
  });
});
