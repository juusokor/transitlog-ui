import {diffDepartureJourney} from "./diffDepartureJourney";
import {getMomentFromDateTime} from "./time";

describe("diffDepartureJourney", () => {
  test("diffDepartureJourney returns an object describing the difference between a departure and an HFP event", () => {
    const date = "2019-01-27";

    const departure = {
      hours: 16,
      minutes: 4,
      isNextDay: false,
    };

    const event = {
      journey_start_time: "16:04:00",
      oday: date,
      received_at: "2019-01-27T16:05:30.000Z", // UTC timestamp 1:30 minutes after scheduled start
    };

    const diff = diffDepartureJourney(event, departure, date);

    const expectPlannedMoment = getMomentFromDateTime(date, "16:04:00");
    const expectObservedMoment = getMomentFromDateTime(date, "16:05:30");

    expect(diff.diff).toBe(90);
    expect(diff.minutes).toBe(1);
    expect(diff.seconds).toBe(30);
    expect(diff.sign).toBe("+");
    expect(diff.observedMoment.valueOf()).toBe(expectObservedMoment.valueOf());
    expect(diff.plannedMoment.valueOf()).toBe(expectPlannedMoment.valueOf());
  });

  test("diffDepartureJourney works with 24h+ times", () => {
    const date = "2019-01-27";

    const departure = {
      hours: 2,
      minutes: 10,
      isNextDay: true,
    };

    const event = {
      journey_start_time: "26:10:00",
      oday: date,
      received_at: "2019-01-28T02:11:30.000Z", // UTC timestamp 1:30 minutes after scheduled start
    };

    const diff = diffDepartureJourney(event, departure, date);

    const expectPlannedMoment = getMomentFromDateTime(date, "26:10:00");
    const expectObservedMoment = getMomentFromDateTime(date, "26:11:30");

    expect(diff.diff).toBe(90);
    expect(diff.minutes).toBe(1);
    expect(diff.seconds).toBe(30);
    expect(diff.sign).toBe("+");
    expect(diff.observedMoment.valueOf()).toBe(expectObservedMoment.valueOf());
    expect(diff.plannedMoment.valueOf()).toBe(expectPlannedMoment.valueOf());
  });
});
