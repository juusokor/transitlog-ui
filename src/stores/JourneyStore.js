import {extendObservable, action} from "mobx";
import {pick} from "lodash";

export default (state) => {
  extendObservable(state, {
    selectedJourney: null,
  });

  const setSelectedJourney = action((journey = null) => {
    state.selectedJourney = journey
      ? pick(journey, "jrn", "oday", "uniqueVehicleId", "journeyStartTime")
      : null;
  });

  return {
    setSelectedJourney,
  };
};
