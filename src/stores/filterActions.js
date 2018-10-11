import {action} from "mobx";
import moment from "moment-timezone";
import get from "lodash/get";

const filterActions = (state) => {
  // Make sure all dates are correctly formed.
  const setDate = action((dateValue) => {
    let momentValue = !dateValue
      ? moment()
      : moment.tz(dateValue, "Europe/Helsinki");

    if (!momentValue.isValid()) {
      momentValue = moment();
    }

    state.date = momentValue.format("YYYY-MM-DD");
  });

  // Grab the nodeId from the passed stop object.
  const setStop = action((stop = "") => {
    state.stop = get(stop, "nodeId", stop);
  });

  // The unique_vehicle_id we're interested in.
  const setVehicle = action((vehicleId) => {
    state.vehicle = vehicleId || "";
  });

  const setLine = action(({lineId = "", dateBegin = "", dateEnd = ""}) => {
    state.line.lineId = lineId;
    state.line.dateBegin = dateBegin;
    state.line.dateEnd = dateEnd;

    setVehicle("");
  });

  const setRoute = action((route) => {
    state.route.routeId = get(route, "routeId", "");
    state.route.direction = get(route, "direction", "");
    state.route.dateBegin = get(route, "dateBegin", "");
    state.route.dateEnd = get(route, "dateEnd", "");
    state.route.originstopId = get(route, "originstopId", "");

    const routeLine = get(route, "line.nodes[0]", null);

    if (routeLine) {
      setLine(routeLine);
    }

    // When the route changes, also reset the vehicle and journey.
    setVehicle("");
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
