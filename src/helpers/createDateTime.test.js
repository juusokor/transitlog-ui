import {createDateTime} from "./createDateTime";
import format from "date-fns/format";

describe("createDateTime", () => {
  test("Creates a date object from a date string and a time string", () => {
    const date = "2018-10-04";
    const time = "12:00:00";

    const dateObject = createDateTime(date, time);

    expect(dateObject).toBeInstanceOf(Date);
    expect(format(dateObject, "YYYY-MM-DD HH:mm:ss")).toBe("2018-10-04 12:00:00");
  });

  test("Returns false if the date or the time is falsy", () => {
    const isFalse = createDateTime("", null);
    expect(isFalse).toBe(false);
  });

  test("Returns false if the date+time string is not ISO-8601 compliant", () => {
    const isFalse = createDateTime("5230_0_45", "25:88.1");
    expect(isFalse).toBe(false);
  });
});
