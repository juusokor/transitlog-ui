import {getLineChunksByDelay} from "./HfpLayer";
import getJourneyId from "../../helpers/getJourneyId";

const defaultPosition = {
  oday: "date",
  journeyStartTime: "starttime",
  routeId: "routeid",
  directionId: "direction",
  dl: 0,
};

function createPositions() {
  const positions = [];

  while (positions.length < 10) {
    const i = positions.length;

    positions.push({
      ...defaultPosition,
      dl: i > 6 ? 40 : i > 3 ? 0 : -300, // Create three chunks
    });
  }

  return positions;
}

describe("HfpLayer", () => {
  test("Cut the hfp positions array into chunks by delayType", () => {
    const positions = createPositions();
    // The function matches the journey to a journeyId
    const matchJourney = getJourneyId(defaultPosition);
    const positionChunks = getLineChunksByDelay(positions, matchJourney);

    expect(positionChunks).toHaveLength(3);
    expect(positionChunks[0].delayType).toBe("late");
    expect(positionChunks[0].positions.length).toBeGreaterThanOrEqual(3);
    expect(positionChunks[1].delayType).toBe("on-time");
    expect(positionChunks[1].positions.length).toBeGreaterThanOrEqual(3);
    expect(positionChunks[2].delayType).toBe("early");
    expect(positionChunks[2].positions.length).toBeGreaterThanOrEqual(3);
  });
});
