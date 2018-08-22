import {extendObservable} from "mobx";
import filterActions from "./filterActions";

export default (state) => {
  extendObservable(state, {
    date: "2018-05-06",
    stop: "",
    vehicle: "",
    line: {
      lineId: "1006T",
      dateBegin: null,
      dateEnd: null,
    },
    route: {
      routeId: null,
      direction: null,
      dateBegin: null,
      dateEnd: null,
    },
  });

  const actions = filterActions(state);

  return {...actions};
};
