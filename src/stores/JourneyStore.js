import {extendObservable, action} from "mobx";
import {pick} from "lodash";
import getJourneyId from "../helpers/getJourneyId";

export default (state) => {
  extendObservable(state, {
    selectedJourney: null,
  });

  const setSelectedJourney = action((journey = null) => {
    if (
      !journey ||
      (state.selectedJourney &&
        getJourneyId(state.selectedJourney) === getJourneyId(journey))
    ) {
      state.selectedJourney = null;
    } else {
      state.selectedJourney = pick(
        journey,
        "oday",
        "uniqueVehicleId",
        "journeyStartTime",
        "directionId",
        "routeId"
      );
    }
  });

  return {
    setSelectedJourney,
  };
};
