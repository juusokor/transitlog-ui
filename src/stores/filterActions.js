import {action} from "mobx";
import moment from "moment";
import get from "lodash/get";

const filterActions = (state) => {
  // Make sure all dates are correctly formed.
  const setDate = action((dateValue) => {
    state.date = moment(dateValue).format("YYYY-MM-DD");
  });

  // Grab the nodeId from the passed stop object.
  const setStop = action((stop = "") => {
    state.stop = get(stop, "nodeId", stop);
  });

  // The uniqueVehicleId we're interested in.
  const setVehicle = action((vehicleId) => {
    state.vehicle = vehicleId || "";
  });

  // We need to save lineId, dateBegin and dateEnd to uniquely
  // identify the line and do further queries based on it.
  const setLine = action(({lineId = "", dateBegin = "", dateEnd = ""}) => {
    state.line.lineId = lineId || "";
    state.line.dateBegin = dateBegin || "";
    state.line.dateEnd = dateEnd || "";
  });

  const setRoute = action(
    ({routeId = "", direction = "", dateBegin = "", dateEnd = ""}) => {
      state.route.routeId = routeId || "";
      state.route.direction = direction || "";
      state.route.dateBegin = dateBegin || "";
      state.route.dateEnd = dateEnd || "";
    }
  );

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
  };
};

export default filterActions;
