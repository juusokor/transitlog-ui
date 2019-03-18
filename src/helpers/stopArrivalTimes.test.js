import {getMomentFromDateTime} from "./time";
import {stopArrivalTimes} from "./stopArrivalTimes";

describe("stopArrivalTimes", () => {
  test("returns the arrival times for a departure", () => {
    const date = "2019-01-30";

    const stopDeparture = {
      hours: 16,
      minutes: 4,
      arrivalHours: 16,
      arrivalMinutes: 3,
      isNextDay: false,
    };

    const events = [
      {
        drst: false,
        tst: "2019-01-30T16:04:09.000Z",
      },
      {
        drst: true,
        tst: "2019-01-30T16:04:10.000Z",
      },
      {
        drst: false,
        tst: "2019-01-30T16:04:11.000Z",
      },
    ];

    const arrivalTimes = stopArrivalTimes(events, stopDeparture, date);

    const expectPlannedMoment = getMomentFromDateTime(date, "16:03:00");
    const expectObservedMoment = getMomentFromDateTime(date, "16:04:10");

    expect(arrivalTimes.arrivalEvent).toBe(events[1]);

    expect(arrivalTimes.arrivalMoment.valueOf()).toBe(expectObservedMoment.valueOf());
    expect(arrivalTimes.plannedArrivalMoment.valueOf()).toBe(
      expectPlannedMoment.valueOf()
    );
  });

  test("Returns false if all arguments are not provided", () => {
    const arrivalTimes = stopArrivalTimes([]);
    expect(arrivalTimes).toBeFalsy();
  });
});
