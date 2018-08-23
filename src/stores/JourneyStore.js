import {extendObservable, action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import TimeActions from "./timeActions";
import FilterActions from "./filterActions";
import moment from "moment";
import journeyActions, {pickJourneyProps} from "./journeyActions";

export default (state) => {
  const history = createHistory();

  extendObservable(state, {
    selectedJourney: null,
  });

  const timeActions = TimeActions(state);
  const filterActions = FilterActions(state);
  const actions = journeyActions(state);

  const selectJourneyFromUrl = action((location) => {
    if (location.pathname.includes("journey")) {
      const [
        // The first two array elements are an empty string and the word "journey".
        // We're not interested in those.
        // eslint-disable-next-line no-unused-vars
        _,
        // eslint-disable-next-line no-unused-vars
        __,
        oday,
        routeId,
        directionId,
        journeyStartTime,
      ] = location.pathname.split("/");

      const date = moment(oday, "YYYYMMDD");
      const time = moment(journeyStartTime, "HHmmss");

      // Validate the data from the url
      if (date.isValid() && time.isValid() && ["1", "2"].includes(directionId)) {
        const dateStr = date.format("YYYY-MM-DD");
        const timeStr = time.format("HH:mm:ss");

        // The pick is a bit redundant here, but I want to make sure
        // that everything assigned to selectedJourney always looks
        // the same. What the pick returns may change in the future...
        const journey = pickJourneyProps({
          oday: dateStr,
          routeId,
          directionId,
          journeyStartTime: timeStr,
        });

        if (getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
          state.selectedJourney = journey;
          timeActions.setTime(timeStr);
          filterActions.setDate(dateStr);
          filterActions.setRoute({routeId, direction: directionId});
        }
      }
    }
  });

  selectJourneyFromUrl(history.location);

  return {
    ...actions,
  };
};
