import getDelayType from "./getDelayType";

describe("getDelayType", () => {
  test("delayType is 'early' if the value is 10 or over (seconds)", () => {
    const delayValue = 10;
    const delayType = getDelayType(delayValue);

    expect(delayType).toBe("early");
  });

  test("delayType is 'late' if the value is minus three minutes or under (-180 seconds)", () => {
    const delayValue = -200;
    const delayType = getDelayType(delayValue);

    expect(delayType).toBe("late");
  });

  test("delayType is 'on-time' if the value more than -180 or less than 10.", () => {
    let delayType = getDelayType(-10);
    expect(delayType).toBe("on-time");

    delayType = getDelayType(9);
    expect(delayType).toBe("on-time");

    delayType = getDelayType(-60);
    expect(delayType).toBe("on-time");

    delayType = getDelayType(0);
    expect(delayType).toBe("on-time");
  });
});
