export const getJourneyAverageSpeeds = (selectedJourneyEvents) => {
  if (!selectedJourneyEvents) return;
  let stopId = selectedJourneyEvents.events[0].next_stop_id;
  let sectionSpeeds = [];
  const speedAverages = [];

  selectedJourneyEvents.events.forEach((event, index) => {
    const nextStopId = event.next_stop_id;
    if (stopId !== nextStopId || selectedJourneyEvents.events.length - 1 === index) {
      speedAverages.push({
        x: speedAverages.length,
        y: averageKilometersPerHour(sectionSpeeds),
      });
      sectionSpeeds = [event.spd];
      stopId = nextStopId;
    } else {
      sectionSpeeds.push(event.spd);
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
