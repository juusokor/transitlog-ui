import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import {getJourneyObject} from "../helpers/getJourneyObject";
import filterActions from "./filterActions";
import {setPathName} from "./UrlManager";
import get from "lodash/get";
import timeActions from "./timeActions";
import {intval} from "../helpers/isWithinRange";

export function createJourneyPath(journey) {
  const dateStr = journey.departureDate.replace(/-/g, "");
  const timeStr = journey.departureTime.replace(/:/g, "");
  return `/journey/${dateStr}/${timeStr}/${journey.routeId}/${
    journey.direction
  }/${journey.uniqueVehicleId.replace("/", "_")}`;
}

export function createCompositeJourney(date, route, time, uniqueVehicleId = "") {
  if (!route || !route.routeId || !date || !time) {
    return false;
  }

  return {
    departureDate: date,
    departureTime: time,
    routeId: route.routeId,
    direction: intval(route.direction),
    originStopId: get(route, "originStopId", get(route, "stopId", "")),
    uniqueVehicleId,
  };
}

export default (state) => {
  const filters = filterActions(state);
  const time = timeActions(state);

  const setSelectedJourney = action("Set selected journey", (journeyItem = null) => {
    if (
      !journeyItem ||
      (state.selectedJourney &&
        getJourneyId(state.selectedJourney) === getJourneyId(journeyItem))
    ) {
      state.selectedJourney = null;
      setPathName("/");
    } else if (journeyItem) {
      const oldVehicle = get(state, "vehicle", "");
      state.selectedJourney = getJourneyObject(journeyItem);
      filters.setRoute(journeyItem);

      if (journeyItem.uniqueVehicleId !== oldVehicle) {
        filters.setVehicle(journeyItem.uniqueVehicleId);
      }

      time.toggleLive(false);
      setPathName(createJourneyPath(journeyItem));
    }
  });

  const setJourneyVehicle = action((vehicleId) => {
    const {selectedJourney} = state;

    if (vehicleId && selectedJourney && !selectedJourney.uniqueVehicleId) {
      selectedJourney.uniqueVehicleId = vehicleId;
      setPathName(createJourneyPath(selectedJourney));
    }
  });

  return {
    setSelectedJourney,
    setJourneyVehicle,
  };
};
