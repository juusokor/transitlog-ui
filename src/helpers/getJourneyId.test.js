import getJourneyId from "./getJourneyId";

describe("getJourneyId", () => {
  const journey = {
    oday: "date",
    journey_start_time: "starttime",
    route_id: "routeid",
    direction_id: "direction",
    instance: 0,
  };

  test("Returns a string that uniquely identifies the journey.", () => {
    const journeyId = getJourneyId(journey);
    expect(journeyId).toBe("journey:date_starttime_routeid_direction_0");
  });

  test("Only cares about relevant props.", () => {
    const modifiedJourney = {...journey, irrelevantProp: "irrelevant value"};
    const journeyId = getJourneyId(modifiedJourney);
    expect(journeyId).toBe("journey:date_starttime_routeid_direction_0");
  });
});
