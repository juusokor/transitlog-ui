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
  const setLine = action(({lineId = null, dateBegin = null, dateEnd = null}) => {
    state.line.lineId = lineId || null;
    state.line.dateBegin = dateBegin || null;
    state.line.dateEnd = dateEnd || null;
  });

  const setRoute = action(
    ({routeId = null, direction = null, dateBegin = null, dateEnd = null}) => {
      state.route.routeId = routeId || null;
      state.route.direction = direction || null;
      state.route.dateBegin = dateBegin || null;
      state.route.dateEnd = dateEnd || null;
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
