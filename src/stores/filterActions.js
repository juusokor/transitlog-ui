import {action} from "mobx";
import moment from "moment-timezone";
import get from "lodash/get";
import {setUrlValue} from "./UrlManager";
import {TIMEZONE} from "../constants";
import {intval} from "../helpers/isWithinRange";

const filterActions = (state) => {
  // Make sure all dates are correctly formed.
  const setDate = action("Set date", (dateValue) => {
    let momentValue = !dateValue ? moment() : moment.tz(dateValue, TIMEZONE);

    if (!momentValue.isValid()) {
      momentValue = moment();
    }

    state.date = momentValue.format("YYYY-MM-DD");
    setUrlValue("date", state.date);
  });

  // Grab the stopId from the passed stop object.
  const setStop = action("Set stop", (stop = "") => {
    // Either get the stopId prop or treat the stop arg as the stopId.
    state.stop = get(stop, "stopId", stop);
    setUrlValue("stop", state.stop);
  });

  // The unique_vehicle_id we're interested in.
  const setVehicle = action("Set vehicle", (vehicleId) => {
    state.vehicle = vehicleId || "";
    setUrlValue("vehicle", state.vehicle);
  });

  const setLine = action("Set line", (lineId) => {
    state.line = lineId;
    setUrlValue("line", state.line);
  });

  const setRoute = action("Set route", (route) => {
    const {routeId = "", direction = "", originStopId = ""} = route || {};

    state.route.routeId = routeId;
    state.route.direction = intval(direction);
    state.route.originStopId = originStopId;

    setUrlValue("route.routeId", state.route.routeId);
    setUrlValue("route.direction", state.route.direction);
    setUrlValue("route.originStopId", state.route.originStopId);
  });

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
  };
};

export default filterActions;
