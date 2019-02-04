import {getMomentFromDateTime} from "../../../helpers/time";
import CalculateTerminalTime from "./CalculateTerminalTime";

describe("CalculateTerminalTime", () => {
  /*
    The terminal time is the duration the vehicle has to stand at the origin stop
    before the actual departure time. It is late if it arrives at the stop after
    [departure time] - [terminal time].
   */

  test("Calculates the terminal time difference", () => {
    const date = "2019-01-30";

    const departure = {
      hours: 16,
      minutes: 10,
      isNextDay: false,
      terminalTime: 2,
    };

    const event = {
      received_at: "2019-01-30T16:07:00.000Z", // 3 minutes before departure, 1 minute before terminal time
    };

    function assert({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) {
      expect(wasLate).toBe(false);
      expect(offsetTime.valueOf()).toBe(
        // OffsetTime is the departure time minus the terminal time.
        getMomentFromDateTime(date, "16:08:00").valueOf()
      );
      expect(sign).toBe("-");
      expect(diffMinutes).toBe(3);
      expect(diffSeconds).toBe(0);
    }

    CalculateTerminalTime({
      children: assert,
      departure,
      event,
      date,
    });
  });

  test("wasLate is true when the vehicle was late for the terminal time", () => {
    const date = "2019-01-30";

    const departure = {
      hours: 16,
      minutes: 10,
      isNextDay: false,
      terminalTime: 2,
    };

    const event = {
      received_at: "2019-01-30T16:10:00.000Z", // Right on departure time, 2 minutes after terminal time
    };

    function assert({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) {
      expect(wasLate).toBe(true);
      expect(sign).toBe("");
      expect(diffMinutes).toBe(0);
      expect(diffSeconds).toBe(0);
    }

    CalculateTerminalTime({
      children: assert,
      departure,
      event,
      date,
    });
  });

  /*
    Recovery time is the leeway the vehicle has to arrive at the destination stop.
    It is late if it arrives after [scheduled arrival time] + [recovery time].
   */

  test("calculates recovery time difference", () => {
    const date = "2019-01-30";

    const departure = {
      arrivalHours: 16,
      arrivalMinutes: 10,
      isNextDay: false,
      recoveryTime: 2,
    };

    const event = {
      received_at: "2019-01-30T16:11:00.000Z", // 1 minute after arrival time, within the recovery time.
    };

    function assert({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) {
      expect(wasLate).toBe(false);
      expect(sign).toBe("+");
      expect(diffMinutes).toBe(1);
      expect(diffSeconds).toBe(0);
    }

    CalculateTerminalTime({
      children: assert,
      departure,
      event,
      date,
      recovery: true,
    });
  });

  test("wasLate is true when vehicle was late for the recovery time", () => {
    const date = "2019-01-30";

    const departure = {
      arrivalHours: 16,
      arrivalMinutes: 10,
      isNextDay: false,
      recoveryTime: 2,
    };

    const event = {
      received_at: "2019-01-30T16:13:00.000Z", // 3 minute after arrival time, 1 minute after recovery time
    };

    function assert({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) {
      expect(wasLate).toBe(true);
      expect(sign).toBe("+");
      expect(diffMinutes).toBe(3);
      expect(diffSeconds).toBe(0);
    }

    CalculateTerminalTime({
      children: assert,
      departure,
      event,
      date,
      recovery: true,
    });
  });
});
