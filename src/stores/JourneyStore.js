import {extendObservable, action} from "mobx";
import {pick} from "lodash";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";

export function pickJourneyProps(hfp) {
  return pick(hfp, "oday", "journeyStartTime", "directionId", "routeId");
}

export default (state) => {
  const history = createHistory();

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
      state.selectedJourney = pickJourneyProps(journey);
    }
  });

  return {
    setSelectedJourney,
  };
};
