import {stopDepartureTimes} from "./stopDepartureTimes";
import {getMomentFromDateTime} from "./time";

describe("stopTimes", () => {
  test("Calculates the arrival and departure time difference for a stop", () => {
    const date = "2019-01-30";

    const stopDeparture = {
      hours: 16,
      minutes: 4,
      isNextDay: false,
    };

    const events = [
      {
        journey_start_time: "16:04:00",
        oday: date,
        received_at: "2019-01-30T16:05:30.000Z", // UTC timestamp 1:30 minutes after schedule
      },
    ];

    const departureTimes = stopDepartureTimes(events, stopDeparture, date);

    const expectedColor = "var(--light-green)";
    const expectPlannedMoment = getMomentFromDateTime(date, "16:04:00");
    const expectObservedMoment = getMomentFromDateTime(date, "16:05:30");

    expect(departureTimes.color).toBe(expectedColor);
    expect(departureTimes.delayType).toBe("on-time");
    expect(departureTimes.departureMoment.valueOf()).toBe(
      expectObservedMoment.valueOf()
    );
    expect(departureTimes.plannedDepartureMoment.valueOf()).toBe(
      expectPlannedMoment.valueOf()
    );
    expect(departureTimes.departureEvent).toBe(events[0]);
    expect(departureTimes.departure).toBe(stopDeparture);
  });

  test("Returns false if all arguments are not provided", () => {
    const departureTimes = stopDepartureTimes([]);
    expect(departureTimes).toBeFalsy();
  });
});
