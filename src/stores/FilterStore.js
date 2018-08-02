import {extendObservable} from "mobx";

export default (state) => {
  extendObservable(state, {
    date: "2018-05-06",
    stop: "",
    vehicle: "",
    line: "1006T",
    route: "",
  });

  const setDate = action((dateValue) => (state.date = dateValue));
  const setStop = action((stopId) => (state.stop = stopId));
  const setVehicle = action((vehicleId) => (state.vehicle = vehicleId));
  const setLine = action((lineId) => (state.line = lineId));
  const setRoute = action((routeId) => (state.route = routeId));

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
  };
};
