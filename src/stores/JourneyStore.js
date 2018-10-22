import {extendObservable, action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import TimeActions from "./timeActions";
import FilterActions from "./filterActions";
import moment from "moment-timezone";
import journeyActions from "./journeyActions";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import uniq from "lodash/uniq";
import compact from "lodash/compact";

export default (state) => {
  const history = createHistory();

  extendObservable(state, {
    selectedJourney: null,
    requestedJourneys: [],
    resolvedJourneyStates: new Map(),
  });

  const timeActions = TimeActions(state);
  const filterActions = FilterActions(state);
  const actions = journeyActions(state);

  // Sets the resolved state of a fetched journey.
  const setResolvedJourneyState = action((journeyId, resolveState) => {
    state.resolvedJourneyStates.set(journeyId, resolveState);
  });

  // Request a journeyId
  const requestJourney = action((journeys = []) => {
    const requestedJourneys = compact(
      Array.isArray(journeys) ? journeys : [journeys]
    );

    if (requestedJourneys.length === 0) {
      return;
    }

    const {route, date} = state;

    if (route && route.routeId && date) {
      const acceptedJourneyRequests = requestedJourneys.reduce(
        (times, journeyTime) => {
          // Create a journey id from the current state + requested time
          const journeyId = getJourneyId({
            oday: date,
            journey_start_time: journeyTime,
            route_id: route.routeId,
            direction_id: route.direction,
          });

          // Is the journey already requested or even resolved?
          const journeyFetchState = state.resolvedJourneyStates.get(journeyId);

          // Make sure we haven't fetched this or that it isn't currently being fetched.
          if (!journeyFetchState) {
            // Set it as pending immediately
            setResolvedJourneyState(journeyId, "pending");
            // And start fetching
            times.push(journeyTime);
          }

          return times;
        },
        []
      );

      state.requestedJourneys.replace(
        uniq([...state.requestedJourneys, ...acceptedJourneyRequests])
      );
    }
  });

  const removeJourneyRequest = action((journey) => {
    const journeyIdIndex = state.requestedJourneys.indexOf(journey);

    if (journeyIdIndex > -1) {
      state.requestedJourneys.splice(journeyIdIndex, 1);
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
          requestJourney(timeStr);
        }
      }
    }
  });

  selectJourneyFromUrl(history.location);

  return {
    ...actions,
    requestJourney,
    removeJourneyRequest,
    setResolvedJourneyState,
  };
};
