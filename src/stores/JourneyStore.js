import {extendObservable, action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import TimeActions from "./timeActions";
import FilterActions from "./filterActions";
import moment from "moment-timezone";
import journeyActions from "./journeyActions";
import {pickJourneyProps} from "../helpers/pickJourneyProps";

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
        journey_start_time,
        route_id,
        direction_id,
      ] = location.pathname.split("/");

      const date = moment.tz(oday, "YYYYMMDD", "Europe/Helsinki");

      let dateStr = "";
      let timeStr = "";

      if (date.isValid()) {
        dateStr = date.format("YYYY-MM-DD");
        filterActions.setDate(dateStr);
      }

      if (date.isValid()) {
        const time = moment.tz(
          `${oday} ${journey_start_time}`,
          "YYYYMMDD HHmmss",
          "Europe/Helsinki"
        );

        if (time.isValid()) {
          timeStr = time.format("HH:mm:ss");
          timeActions.setTime(timeStr);
        }
      }

      if (route_id && direction_id) {
        filterActions.setRoute({routeId: route_id, direction: direction_id});
      }

      // Validate the data from the url
      if (dateStr && timeStr && route_id && direction_id) {
        // The pick is a bit redundant here, but I want to make sure
        // that everything assigned to selectedJourney always looks
        // the same. What the pick returns may change in the future...
        const journey = pickJourneyProps({
          oday: dateStr,
          route_id,
          direction_id,
          journey_start_time: timeStr,
        });

        if (getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
          state.selectedJourney = journey;
        }
      }
    }
  });

  selectJourneyFromUrl(history.location);

  return {
    ...actions,
  };
};
