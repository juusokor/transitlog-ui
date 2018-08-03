import {extendObservable, action} from "mobx";
import moment from "moment";

export default (state) => {
  extendObservable(state, {
    date: "2018-05-06",
    stop: "",
    vehicle: "",
    line: "1006T",
    route: "",
    routeDirection: 1,
  });

  const setDate = action(
    (dateValue) => (state.date = moment(dateValue).format("YYYY-MM-DD"))
  );
  const setStop = action((stopId) => (state.stop = stopId));
  const setVehicle = action((vehicleId) => (state.vehicle = vehicleId));
  const setLine = action((lineId) => (state.line = lineId));
  const setRoute = action((routeId, direction) => {
    state.route = routeId;
    state.routeDirection = direction;
  });

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
  };
};
