import {extendObservable, action} from "mobx";
import {pick} from "lodash";

export default (state) => {
  extendObservable(state, {
    selectedJourney: null,
  });

  const setSelectedJourney = action((journey = null) => {
    state.selectedJourney = pick(
      journey,
      "jrn",
      "oday",
      "uniqueVehicleId",
      "journeyStartTime"
    );
  });

  return {
    setSelectedJourney,
  };
};
