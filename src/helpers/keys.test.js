import {createRouteKey, createRouteId} from "./keys";

describe("Key helpers", () => {
  test("createRouteKey creates a route identifier from a route object", () => {
    const route = {
      routeId: "123",
      direction: "1",
      dateBegin: "2019-01-28",
      dateEnd: "2019-01-28",
    };

    const routeId = createRouteKey(route);
    const expected = "123_1_2019-01-28_2019-01-28";

    expect(routeId).toBe(expected);
  });

  test("createRouteKey returns an empty string if all data is not present", () => {
    const route = {
      routeId: "123",
      direction: "1",
    };

    const routeId = createRouteKey(route);
    const expected = "";

    expect(routeId).toBe(expected);
  });

  test("createRouteKey creates a partial route key if asked", () => {
    const route = {
      routeId: "123",
      direction: "1",
    };

    // Pass true to create a partial key
    const routeId = createRouteKey(route, true);
    const expected = "123_1";

    expect(routeId).toBe(expected);
  });

  test("createRouteId creates a route identifier without the date parts", () => {
    const route = {
      routeId: "123",
      direction: "1",
    };

    const routeId = createRouteId(route);
    const expected = "123_1";

    expect(routeId).toBe(expected);
  });

  test("createRouteId can read from HFP events", () => {
    // hfp-style props
    const route = {
      route_id: "123",
      direction_id: 1,
    };

    const routeId = createRouteId(route);
    const expected = "123_1";

    expect(routeId).toBe(expected);
  });

  test("createRouteId can be partial or empty", () => {
    const route1 = {
      route_id: "123",
    };

    const routeId = createRouteId(route1);
    const expected1 = "123";

    expect(routeId).toBe(expected1);

    const route2 = {};

    const routeId2 = createRouteId(route2);
    const expected2 = "";

    expect(routeId2).toBe(expected2);
  });
});
