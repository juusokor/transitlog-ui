import {extendObservable, action} from "mobx";
import {pick} from "lodash";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import TimeActions from "./timeActions";
import FilterActions from "./filterActions";

export function pickJourneyProps(hfp) {
  return pick(hfp, "oday", "journeyStartTime", "directionId", "routeId");
}

export default (state) => {
  const history = createHistory();

  extendObservable(state, {
    selectedJourney: null,
  });

  const timeActions = TimeActions(state);
  const filterActions = FilterActions(state);

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

  const selectJourneyFromUrl = action((location) => {
    if (location.pathname.includes("journey")) {
      const [
        _,
        oday,
        routeId,
        directionId,
        journeyStartTime,
      ] = location.pathname.split("/");
      setSelectedJourney({oday, routeId, directionId, journeyStartTime});
      timeActions.setTime(journeyStartTime);
      filterActions.setDate(oday);
      filterActions.setRoute(routeId);
    }
  });

  selectJourneyFromUrl(history.location);

  return {
    setSelectedJourney,
  };
};
