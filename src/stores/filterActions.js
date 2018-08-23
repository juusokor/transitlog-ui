import {action} from "mobx";
import moment from "moment";
import get from "lodash/get";
import mergeWithObservable from "../helpers/mergeWithObservable";

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

  const setLine = action((line) => {
    mergeWithObservable(state.line, line);
  });

  const setRoute = action((route) => {
    mergeWithObservable(state.route, route);
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
