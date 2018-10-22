import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import createHistory from "history/createBrowserHistory";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import moment from "moment-timezone";
import {combineDateAndTime} from "../helpers/time";
import uniq from "lodash/uniq";
import compact from "lodash/compact";

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
  const setResolvedJourneyState = action(
    "Set the status of a requested journey",
    (journeyId, resolveState) => {
      state.resolvedJourneyStates.set(journeyId, resolveState);
    }
  );

  // Request a journeyId
  const requestJourney = action("Request a journey by time", (journeys = []) => {
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
          const journeyId = getJourneyId(getJourneyFromStateAndTime(journeyTime));

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

  const removeJourneyRequest = action("Remove requested journey time", (journey) => {
    const journeyIdIndex = state.requestedJourneys.indexOf(journey);

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
        history.push("/");
      } else {
        const journey = pickJourneyProps(hfpItem);

        state.selectedJourney = journey;
        requestJourney(journey.journey_start_time);
        history.push(createJourneyPath(hfpItem));
      }
    }
  );

  return {
    setSelectedJourney,
    requestJourney,
    removeJourneyRequest,
    setResolvedJourneyState,
    getJourneyFromStateAndTime,
  };
};
