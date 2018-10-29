import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import moment from "moment-timezone";
import {combineDateAndTime} from "../helpers/time";
import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import compact from "lodash/compact";
import {journeyFetchStates} from "./JourneyStore";
import filterActions from "./filterActions";
import {createRouteKey} from "../helpers/keys";

const history = createHistory();

export function createJourneyPath(journey) {
  let startTimestamp = journey.journey_start_timestamp;

  if (!startTimestamp) {
    startTimestamp = combineDateAndTime(
      journey.oday,
      journey.journey_start_time,
      "Europe/Helsinki"
    );
  }

  const date = moment(startTimestamp).tz("Europe/Helsinki");

  const dateStr = date.format("YYYYMMDD");
  const timeStr = date.format("HHmm");

  return `/journey/${dateStr}/${timeStr}/${journey.route_id}/${
    journey.direction_id
  }`;
}

export default (state) => {
  const filters = filterActions(state);

  function getJourneyFromStateAndTime(
    time,
    useRoute = state.route,
    useDate = state.date
  ) {
    if (!useRoute || !useRoute.routeId || !useDate || !time) {
      return false;
    }

    const journey = {
      oday: useDate,
      journey_start_time: time,
      journey_start_timestamp: combineDateAndTime(useDate, time, "Europe/Helsinki"),
      route_id: useRoute.routeId,
      direction_id: useRoute.direction,
    };

    return journey;
  }

  // Sets the resolved state of a fetched journey.
  const setJourneyFetchState = action(
    "Set the status of a requested journey",
    (journeyId, resolveState) => {
      state.resolvedJourneyStates.set(journeyId, resolveState);
    }
  );

  /** Request a journey or multiple journeys by a journey request object.
   * The request object:
   * {
   *   time: the journey_start_time you want to query for,
   *   date: the date you want to query for (oday),
   *   route: {
   *     routeId: the routeId you're interested in,
   *     direction: the direction of the route
   *   }
   * }
   */
  const requestJourneys = action("Request a journey by time", (journeys = []) => {
    const requestedJourneys = compact(
      Array.isArray(journeys) ? journeys : [journeys]
    );

    if (requestedJourneys.length === 0) {
      return;
    }

    const acceptedRequests = [];

    for (const journeyRequest of requestedJourneys) {
      const {route, date, time, vehicleId} = journeyRequest;

      if (vehicleId && !time) {
        // We can't make a journeyId with vehicle requests to check
        // for pending requests, so just accept it and move on.
        acceptedRequests.push(journeyRequest);
        continue;
      }
      // Create a journey id from the current state + requested time
      const journeyId = getJourneyId(getJourneyFromStateAndTime(time, route, date));

      if (!journeyId) {
        continue;
      }

      // Is the journey already requested or even resolved?
      const journeyFetchState = state.resolvedJourneyStates.get(journeyId);

      // Make sure that it isn't currently being fetched.
      if (!journeyFetchState || journeyFetchState !== journeyFetchStates.PENDING) {
        // Set it as pending immediately
        setJourneyFetchState(journeyId, journeyFetchStates.PENDING);
        // And start fetching
        acceptedRequests.push(journeyRequest);
      }
    }

    if (acceptedRequests.length) {
      state.requestedJourneys = uniqBy(
        [...state.requestedJourneys, ...acceptedRequests],
        (req) =>
          `${req.route.routeId}_${req.route.direction}_${req.date}_${req.time}`
      );
    }
  });

  const removeJourneyRequest = action("Remove requested journey time", (journey) => {
    const journeyIdIndex = state.requestedJourneys.findIndex(
      (j) =>
        (j.time === journey.time || j.vehicleId === journey.vehicleId) &&
        createRouteKey(j.route, true) === createRouteKey(journey.route, true) &&
        j.date === journey.date
    );

    if (journeyIdIndex > -1) {
      state.requestedJourneys.splice(journeyIdIndex, 1);
    }
  });

  const setSelectedJourney = action(
    "Set selected journey",
    (hfpItem = null, toggle = true) => {
      if (
        (!hfpItem && toggle) ||
        (state.selectedJourney &&
          getJourneyId(state.selectedJourney) === getJourneyId(hfpItem))
      ) {
        state.selectedJourney = null;
        filters.setVehicle(null);
        history.push("/");
      } else if (hfpItem) {
        const journey = pickJourneyProps(hfpItem);
        state.selectedJourney = journey;

        if (hfpItem.unique_vehicle_id) {
          filters.setVehicle(hfpItem.unique_vehicle_id);
        }

        history.push(createJourneyPath(hfpItem));
      }
    }
  );

  return {
    setSelectedJourney,
    requestJourneys,
    removeJourneyRequest,
    setJourneyFetchState,
    getJourneyFromStateAndTime,
  };
};
