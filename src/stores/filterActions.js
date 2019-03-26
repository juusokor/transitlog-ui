import {action} from "mobx";
import moment from "moment-timezone";
import get from "lodash/get";
import {setUrlValue} from "./UrlManager";
import {TIMEZONE} from "../constants";

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

  const setGraphHoverHighlight = action("Set stop", (stop = "") => {
    state.graphHoverHighlight = stop;
  });

  // The unique_vehicle_id we're interested in.
  const setVehicle = action("Set vehicle", (vehicleId) => {
    state.vehicle = vehicleId || "";
    setUrlValue("vehicle", state.vehicle);
  });

  const setLine = action(
    "Set line",
    ({lineId = "", dateBegin = "", dateEnd = ""}) => {
      state.line.lineId = lineId;
      state.line.dateBegin = dateBegin;
      state.line.dateEnd = dateEnd;

      setUrlValue("line.lineId", state.line.lineId);
    }
  );

  const setRoute = action("Set route", (route) => {
    state.route.routeId = get(route, "routeId", "");
    state.route.direction = get(route, "direction", "") + "";
    state.route.dateBegin = get(route, "dateBegin", "");
    state.route.dateEnd = get(route, "dateEnd", "");
    state.route.originstopId = get(route, "originstopId", "");

    setUrlValue("route.routeId", state.route.routeId);
    setUrlValue("route.direction", state.route.direction);

    const routeLine = get(route, "line.nodes[0]", null);

    if (routeLine) {
      setLine(routeLine);
    }
  });

  return {
    setDate,
    setStop,
    setGraphHoverHighlight,
    setVehicle,
    setLine,
    setRoute,
  };
};

export default filterActions;
