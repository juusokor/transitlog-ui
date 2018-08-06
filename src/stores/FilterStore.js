import {extendObservable, action} from "mobx";
import moment from "moment";

export default (state) => {
  extendObservable(state, {
    date: "2018-05-06",
    stop: "",
    vehicle: "",
    line: "1006T",
    route: "",
  });

  // Make sure all dates are correctly formed.
  const setDate = action((dateValue) => {
    state.date = moment(dateValue).format("YYYY-MM-DD");
  });

  // Grab the nodeId from the passed stop object.
  const setStop = action(({nodeId}) => {
    state.stop = nodeId;
  });

  // The uniqueVehicleId we're interested in.
  const setVehicle = action((vehicleId) => {
    state.vehicle = vehicleId;
  });

  // Grab lineId from the passed line. Lines do not have nodeId's.
  const setLine = action(({lineId}) => {
    state.line = lineId;
  });

  // Grab the nodeId from the passed route.
  const setRoute = action(({nodeId}) => {
    state.route = nodeId;
  });

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
  };
};
