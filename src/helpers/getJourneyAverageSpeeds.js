export const getJourneyAverageSpeeds = (selectedJourneyEvents = []) => {
  if (!selectedJourneyEvents || selectedJourneyEvents.length === 0) {
    return;
  }

  let stopId = selectedJourneyEvents.nextStopId;
  let sectionSpeeds = [];
  const speedAverages = [];

  selectedJourneyEvents.forEach((event, index) => {
    const nextStopId = event.nextStopId;
    if (stopId !== nextStopId || selectedJourneyEvents.length - 1 === index) {
      speedAverages.push({
        x: speedAverages.length,
        y: averageKilometersPerHour(sectionSpeeds),
      });
      sectionSpeeds = [event.velocity];
      stopId = nextStopId;
    } else {
      sectionSpeeds.push(event.velocity);
    }
  });

  return speedAverages;
};

const averageKilometersPerHour = (sectionSpeeds) => {
  let metersPerSecondSum = 0;
  sectionSpeeds.forEach((metersPerSecond) => {
    metersPerSecondSum = metersPerSecondSum + metersPerSecond;
  });
  const metersPerSecondAvg = metersPerSecondSum / sectionSpeeds.length;
  let kilometersPerHour = Math.round((metersPerSecondAvg * 18) / 5);
  if (!kilometersPerHour) kilometersPerHour = 0;
  return kilometersPerHour;
};
