import {action} from "mobx";
import getJourneyId from "../helpers/getJourneyId";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import filterActions from "./filterActions";
import {setPathName} from "./UrlManager";
import get from "lodash/get";
import timeActions from "./timeActions";

export function createJourneyPath(journey) {
  const dateStr = journey.oday.replace(/-/g, "");
  const timeStr = journey.journey_start_time.replace(/:/g, "");
  const instance = get(journey, "instance", 0);

  return `/journey/${dateStr}/${timeStr}/${journey.route_id}/${
    journey.direction_id
  }/${instance}`;
}

export function createCompositeJourney(date, route, time, instance = 0) {
  if (!route || !route.routeId || !date || !time) {
    return false;
  }

  const journey = {
    oday: date,
    journey_start_time: time,
    route_id: route.routeId,
    direction_id: route.direction,
    instance: instance || 0,
  };

  return journey;
}

export default (state) => {
  const filters = filterActions(state);
  const time = timeActions(state);

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
        state.selectedJourney = pickJourneyProps(hfpItem);

        filters.setRoute({
          routeId: hfpItem.route_id,
          direction: hfpItem.direction_id + "",
        });

        if (hfpItem.unique_vehicle_id) {
          filters.setVehicle(hfpItem.unique_vehicle_id);
        }

        setPathName(createJourneyPath(hfpItem));
      }

      time.toggleLive(false);
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
