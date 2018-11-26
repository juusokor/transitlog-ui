import {extendObservable, action} from "mobx";
import filterActions from "./filterActions";
import mergeWithObservable from "../helpers/mergeWithObservable";
import JourneyActions from "./journeyActions";
import {inflate} from "../helpers/inflate";
import pick from "lodash/pick";
import merge from "lodash/merge";
import {resetUrlState} from "./UrlManager";

export default (state, initialState) => {
  const resetListeners = [];

  const emptyState = {
    date: "2018-05-07",
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
      originstopId: "",
    },
    setResetListener: action((cb) => {
      resetListeners.push(cb);
    }),
  };

  extendObservable(
    state,
    merge(emptyState, pick(inflate(initialState), ...Object.keys(emptyState)))
  );

  const journeyActions = JourneyActions(state);
  const actions = filterActions(state);

  const reset = action(() => {
    mergeWithObservable(state, emptyState);
    resetUrlState(true);

    journeyActions.setSelectedJourney(null);
    state.requestedJourneys.clear();

    resetListeners.forEach((cb) => {
      if (typeof cb === "function") {
        cb();
      }
    });
  });

  return {
    ...actions,
    reset,
  };
};
