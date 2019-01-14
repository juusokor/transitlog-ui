import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import moment from "moment-timezone";
import {combineDateAndTime} from "../helpers/time";
import filterActions from "./filterActions";
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
    setJourneyFetchState,
    createCompositeJourney,
  };
};
