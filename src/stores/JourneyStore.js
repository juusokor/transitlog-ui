import {extendObservable, action} from "mobx";
import {pick} from "lodash";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import TimeActions from "./timeActions";
import FilterActions from "./filterActions";
import moment from "moment";

export function pickJourneyProps(hfp) {
  return pick(hfp, "oday", "journeyStartTime", "directionId", "routeId");
}

function createJourneyPath(journey) {
  const date = new Date(`${journey.oday}T${journey.journeyStartTime}`);
  // ensure double.digit date and month
  const dateStr = `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${(
    "0" + date.getDate()
  ).slice(-2)}`;

  const timeStr = `${date.getHours()}${date.getMinutes()}`;

  return `/journey/${dateStr}/${journey.routeId}/${journey.directionId}/${timeStr}`;
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
      history.push(createJourneyPath(journey));
    }
  });

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

        // The pick is a bit redundant here, but I want to make sure that everything
        // assigned to selectedJourney always looks the same. It might change in the future...
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

  history.listen((location) => {
    selectJourneyFromUrl(location);
  });

  return {
    setSelectedJourney,
  };
};
