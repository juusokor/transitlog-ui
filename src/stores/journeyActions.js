import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import moment from "moment-timezone";
import {combineDateAndTime} from "../helpers/time";
import uniqBy from "lodash/uniqBy";
import compact from "lodash/compact";
import {journeyFetchStates} from "./JourneyStore";
import filterActions from "./filterActions";
import {createRouteKey} from "../helpers/keys";
import {setPathName} from "./UrlManager";

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

export function createCompositeJourney(date, route, time) {
  if (!route || !route.routeId || !date || !time) {
    return false;
  }

  const journey = {
    oday: date,
    journey_start_time: time,
    journey_start_timestamp: combineDateAndTime(date, time, "Europe/Helsinki"),
    route_id: route.routeId,
    direction_id: route.direction,
  };

  return journey;
}

export default (state) => {
  const filters = filterActions(state);

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
      const {route, date, time} = journeyRequest;
      // Create a journey id from the current state + requested time
      const journeyId = getJourneyId(createCompositeJourney(date, route, time));

      if (!journeyId) {
        continue;
      }

      // Is the journey already requested or even resolved?
      const journeyFetchState = state.resolvedJourneyStates.get(journeyId);

      // Make sure that it isn't currently being fetched.
      if (!journeyFetchState || journeyFetchState !== journeyFetchStates.PENDING) {
        acceptedRequests.push({
          ...journeyRequest,
          journeyId,
          // Make a new request if it wasn't found previously.
          skipCache: journeyFetchState === journeyFetchStates.NOTFOUND,
        });
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
        j.time === journey.time &&
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
        setPathName("/");
      } else if (hfpItem) {
        const journey = pickJourneyProps(hfpItem);
        state.selectedJourney = journey;

        if (hfpItem.unique_vehicle_id) {
          filters.setVehicle(hfpItem.unique_vehicle_id);
        }

        setPathName(createJourneyPath(hfpItem));
      }
    }
  );

  return {
    setSelectedJourney,
    requestJourneys,
    removeJourneyRequest,
    setJourneyFetchState,
    createCompositeJourney,
  };
};
