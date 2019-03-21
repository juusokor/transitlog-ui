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
  const instance = get(journey, "instance", 0);

  return `/journey/${dateStr}/${timeStr}/${journey.routeId}/${
    journey.direction
  }/${instance}`;
}

export function createCompositeJourney(date, route, time, instance = 0) {
  if (!route || !route.routeId || !date || !time) {
    return false;
  }

  const journey = {
    departureDate: date,
    departureTime: time,
    routeId: route.routeId,
    direction: intval(route.direction),
    originStopId: get(route, "originStopId", get(route, "stopId", "")),
    instance: instance || 0,
  };

  return journey;
}

export default (state) => {
  const filters = filterActions(state);
  const time = timeActions(state);

  const setSelectedJourney = action(
    "Set selected journey",
    (journeyItem = null, instance = 0) => {
      if (
        !journeyItem ||
        (state.selectedJourney &&
          getJourneyId(state.selectedJourney) === getJourneyId(journeyItem))
      ) {
        state.selectedJourney = null;
        filters.setVehicle(null);
        setPathName("/");
      } else if (journeyItem) {
        const useInstance = journeyItem.instance || instance;
        state.selectedJourney = getJourneyObject({...journeyItem, useInstance});

        filters.setRoute(journeyItem);

        if (journeyItem.uniqueVehicleId) {
          filters.setVehicle(journeyItem.uniqueVehicleId);
        }

        time.toggleLive(false);
        setPathName(createJourneyPath(journeyItem));
      }
    }
  );

  const setJourneyVehicle = action((vehicleId) => {
    const {selectedJourney} = state;

    if (
      vehicleId &&
      selectedJourney &&
      (!selectedJourney.unique_vehicle_id ||
        selectedJourney.unique_vehicle_id === "unknown-vehicle")
    ) {
      selectedJourney.unique_vehicle_id = vehicleId;
    }
  });

  return {
    setSelectedJourney,
    setJourneyVehicle,
    createCompositeJourney,
  };
};
