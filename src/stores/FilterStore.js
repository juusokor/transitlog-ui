import {extendObservable} from "mobx";
import filterActions from "./filterActions";

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
    route: {
      routeId: "",
      direction: "",
      dateBegin: "",
      dateEnd: "",
    },
  });

  const actions = filterActions(state);

  return {...actions};
};
