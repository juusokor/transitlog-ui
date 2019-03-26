export const getJourneyStopDiffs = (journeyStops) => {
  return journeyStops.map((journey, index) => {
    let departureColor = "var(--light-grey)";
    let y = 0;
    let stopId = null;
    if (journey.departureDiff) {
      departureColor = journey.departureColor;
      y = journey.departureDiff.diff;
      stopId = journey.stopId;
    }
    return {
      x: index,
      y: y,
      y0: 0,
      departureColor: departureColor,
      stopId: stopId,
    };
  });
};
