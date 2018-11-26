import {extendObservable, action, observable} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import FilterActions from "./filterActions";
import moment from "moment-timezone";
import journeyActions from "./journeyActions";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import {getPathName} from "./UrlManager";

export const journeyFetchStates = {
  PENDING: "pending",
  RESOLVED: "resolved",
  NOTFOUND: "notfound",
  ERROR: "error",
};

export default (state) => {
  const history = createHistory();

  extendObservable(
    state,
    {
      selectedJourney: null,
      requestedJourneys: [],
      resolvedJourneyStates: new Map(),
    },
    {
      requestedJourneys: observable.shallow,
    }
  );

  const filterActions = FilterActions(state);
  const actions = journeyActions(state);

  const selectJourneyFromUrl = action((pathname) => {
    const [
      // The first two array elements are an empty string and the word "journey".
      // eslint-disable-next-line no-unused-vars
      _,
      basePath,
      oday,
      journey_start_time,
      route_id,
      direction_id,
    ] = pathname.split("/");

    if (basePath === "journey") {
      const date = moment.tz(oday, "YYYYMMDD", "Europe/Helsinki");

      let dateStr = "";
      let timeStr = "";

      if (date.isValid()) {
        dateStr = date.format("YYYY-MM-DD");
        filterActions.setDate(dateStr);

        const time = moment.tz(
          `${oday} ${journey_start_time}`,
          "YYYYMMDD HHmmss",
          "Europe/Helsinki"
        );

        if (time.isValid()) {
          timeStr = time.format("HH:mm:ss");
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
          actions.requestJourneys({
            time: timeStr,
            route: {routeId: route_id, direction: direction_id},
            date: dateStr,
          });
        }
      }
    }
  });

  selectJourneyFromUrl(getPathName());

  return {
    ...actions,
  };
};
