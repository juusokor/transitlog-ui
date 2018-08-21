import {extendObservable, action} from "mobx";
import moment from "moment";
import get from "lodash/get";

export default (state) => {
  extendObservable(state, {
    date: "2018-05-06",
    stop: "",
    vehicle: "",
    line: {
      lineId: "1006T",
      dateBegin: "",
      dateEnd: "",
    },
    route: "",
  });

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
    state.vehicle = vehicleId;
  });

  // We need to save lineId, dateBegin and dateEnd to uniquely
  // identify the line and do further queries based on it.
  const setLine = action(({lineId = "", dateBegin = "", dateEnd = ""}) => {
    state.line.lineId = lineId;
    state.line.dateBegin = dateBegin;
    state.line.dateEnd = dateEnd;
  });

  // Grab the nodeId from the passed route.
  const setRoute = action((route = "") => {
    state.route = get(route, "nodeId", route);
  });

  const reset = action(() => {
    state.stop = "";
    state.vehicle = "";
    state.line = {
      lineId: "",
      dateBegin: "",
      dateEnd: "",
    };
    state.route = "";
  });

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
    reset,
  };
};
