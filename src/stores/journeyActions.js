import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import moment from "moment-timezone";
import {combineDateAndTime} from "../helpers/time";
import uniq from "lodash/uniq";
import get from "lodash/get";
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

  function getJourneyFromStateAndTime(time) {
    const {route, date} = state;

    if (!route || !route.routeId || !date || !time) {
      return "";
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

  // Sets the resolved state of a fetched journey.
  const setJourneyFetchState = action(
    "Set the status of a requested journey",
    (journeyId, resolveState) => {
      state.resolvedJourneyStates.set(journeyId, resolveState);
    }
  );

  // Request a journeyId or multiple journeyIds
  const requestVehicleJourneys = action(
    "Request journeys by vehicle",
    (vehicleIds = []) => {
      const requestedVehicles = compact(
        Array.isArray(vehicleIds) ? vehicleIds : [vehicleIds]
      );

      if (requestedVehicles.length === 0) {
        return;
      }

      const {route, date} = state;

      if (route && route.routeId && date) {
        state.requestedVehicleJourneys.replace(
          uniq([...state.requestedVehicleJourneys, ...requestedVehicles])
        );
      }
    }
  );

  // Request a journeyId or multiple journeyIds
  const requestJourneys = action("Request a journey by time", (journeys = []) => {
    const requestedJourneys = compact(
      Array.isArray(journeys) ? journeys : [journeys]
    );

    if (requestedJourneys.length === 0) {
      return;
    }

    const {route, date} = state;

    if (route && route.routeId && date) {
      const journeyRequests = requestedJourneys.reduce((times, journeyTime) => {
        // Create a journey id from the current state + requested time
        const journeyId = getJourneyId(getJourneyFromStateAndTime(journeyTime));

        // Is the journey already requested or even resolved?
        const journeyFetchState = state.resolvedJourneyStates.get(journeyId);

        // Make sure we haven't fetched this or that it isn't currently being fetched.
        if (!journeyFetchState) {
          // Set it as pending immediately
          setJourneyFetchState(journeyId, journeyFetchStates.PENDING);
          // And start fetching
          times.push({time: journeyTime, route, date});
        }

        return times;
      }, []);

      state.requestedJourneys.replace(
        uniq([...state.requestedJourneys, ...journeyRequests])
      );
    }
  });

  const removeJourneyRequest = action("Remove requested journey time", (journey) => {
    const journeyIdIndex = state.requestedJourneys.findIndex(
      (j) =>
        j.time === journey.time &&
        createRouteKey(j.route) === createRouteKey(journey.route) &&
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
        (!hfpItem ||
          (state.selectedJourney &&
            getJourneyId(state.selectedJourney) === getJourneyId(hfpItem))) &&
        toggle
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

        requestJourneys(journey.journey_start_time);
        history.push(createJourneyPath(hfpItem));
      }
    }
  );

  return {
    setSelectedJourney,
    requestJourneys,
    requestVehicleJourneys,
    removeJourneyRequest,
    setJourneyFetchState,
    getJourneyFromStateAndTime,
  };
};
