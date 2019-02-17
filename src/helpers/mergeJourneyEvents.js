import flatten from "lodash/flatten";
import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";

export function mergeJourneyEvents(...eventCollections) {
  const flatCollection = flatten(eventCollections);

  return reduce(
    groupBy(flatCollection, "journeyId"),
    (mergedJourneys, journeyGroup) => {
      let selectedEvents = [];

      for (const {events} of journeyGroup) {
        if (events.length > selectedEvents.length) {
          selectedEvents = events;
        }
      }

      const journey = {
        journeyId: journeyGroup[0].journeyId,
        events: selectedEvents,
      };

      mergedJourneys.push(journey);
      return mergedJourneys;
    },
    []
  );
}
