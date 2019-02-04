import {observable} from "mobx";
import FilterStore, {setResetListener} from "./FilterStore";

describe("FilterStore", () => {
  test("It extends the provided state object with the filter state", () => {
    // Create empty state
    const state = observable({});
    FilterStore(state);

    // Just check that it adds some keys. We don't want to assert the presence of
    // the exact state props here as that would make the test fragile.
    expect(Object.keys(state).length).toBeGreaterThan(0);
  });

  test("It adds the provided initialState to the state.", () => {
    // The FilterStore accepts any props in initialState when testing. This is because
    // we don't want to be too tied up in the exact state props.
    const initialState = {
      date: "2018-04-13",
      stop: "1234567",
      vehicle: "04/13",
      "line.lineId": "1013",
      "route.routeId": "1013",
      "route.direction": "1",
    };

    // Create empty state
    const state = observable({});
    FilterStore(state, initialState);

    expect(state.date).toBe("2018-04-13");
    expect(state.stop).toBe("1234567");
    expect(state.vehicle).toBe("04/13");
    expect(state.line).toMatchObject({lineId: "1013"});
    expect(state.route).toMatchObject({routeId: "1013", direction: "1"});
  });

  test("It can reset the state", () => {
    const resetCallback = jest.fn();

    const initialState = {
      date: "2018-04-13",
      stop: "1234567",
      "route.routeId": "1013",
      "route.direction": "1",
    };

    const state = observable({});
    const {reset} = FilterStore(state, initialState);

    setResetListener(resetCallback);

    reset();

    expect(resetCallback).toHaveBeenCalledTimes(1);
    // It should reset the stop
    expect(state.stop).toBe("");
    // ...and the route
    expect(state.route.routeId).toBe("");
    expect(state.route.direction).toBe("");
    // but it should NOT reset the date
    expect(state.date).toBe(initialState.date);
  });

  test("setRoute sets the route props in the state", () => {
    const line = {
      lineId: "1013",
      dateBegin: "2018-04-13",
      dateEnd: "2019-04-13",
    };

    const route = {
      routeId: "1013",
      direction: "1",
      dateBegin: "2018-04-13",
      dateEnd: "2019-04-13",
      originstopId: "1234567",
    };

    const state = observable({});
    const {setRoute} = FilterStore(state);

    expect(state.route.routeId).toBe("");

    setRoute(route);

    expect(state.route).toMatchObject(route);
    expect(state.line.lineId).toBe("");

    // If the route object includes the line, like it would when coming from the JORE API,
    // setRoute can also add the line data to the state.

    const routeWithLine = {...route, line: {nodes: [line]}};

    setRoute(routeWithLine);

    expect(state.route).toMatchObject(route);
    expect(state.line).toMatchObject(line);
  });
});
