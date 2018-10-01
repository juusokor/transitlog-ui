import getJourneyId from "./getJourneyId";

const journey = {
  oday: "date",
  journeyStartTime: "starttime",
  routeId: "routeid",
  directionId: "direction",
};

describe("getJourneyId", () => {
  test("Returns a string that uniquely identifies the journey.", () => {
    const journeyId = getJourneyId(journey);
    expect(journeyId).toBe("journey:date_starttime_routeid_direction");
  });

  test("Only cares about relevant props.", () => {
    const modifiedJourney = {...journey, irrelevantProp: "irrelevant value"};
    const journeyId = getJourneyId(modifiedJourney);
    expect(journeyId).toBe("journey:date_starttime_routeid_direction");
  });
});
