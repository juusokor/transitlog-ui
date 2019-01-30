import {stopDepartureTimes} from "../../../helpers/stopDepartureTimes";
import {getMomentFromDateTime} from "../../../helpers/time";
import CalculateTerminalTime from "./CalculateTerminalTime";

describe("CalculateTerminalTime", () => {
  test("Calculates the terminal time", () => {
    const date = "2019-01-30";

    const departure = {
      hours: 16,
      minutes: 10,
      isNextDay: false,
      terminalTime: 2,
    };

    const event = {
      received_at: "2019-01-30T16:07:00.000Z",
    };

    function assert({offsetTime, wasLate, diffMinutes, diffSeconds, sign}) {
      expect(wasLate).toBe(false);
      expect(offsetTime.valueOf()).toBe(
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
});
