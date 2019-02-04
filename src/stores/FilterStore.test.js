import {observable} from "mobx";
import FilterStore from "./FilterStore";

describe("FilterStore", () => {
  test("It extends the provided state object with the filter state", () => {
    // Create empty state
    const state = observable({});
    FilterStore(state);

    // Just check that it adds some keys. We don't want to assert the presence of
    // the exact state props here as that would make the test more fragile.
    expect(Object.keys(state).length).toBeGreaterThan(0);
  });

  test("It adds the provided initialState to the state.", () => {
    const initialState = {
      date: "2018-04-13",
      stop: "1234567",
      vehicle: "04/13",
    };

    // Create empty state
    const state = observable({});
    FilterStore(state, initialState);

    // Just check that it adds some keys. We don't want to assert the presence of
    // the exact state props here as that would make the test more fragile.
    expect(state.date).toBe("2018-04-13");
    expect(state.stop).toBe("1234567");
    expect(state.vehicle).toBe("04/13");
  });
});
