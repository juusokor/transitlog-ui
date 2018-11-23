import {extendObservable, action} from "mobx";
import filterActions from "./filterActions";
import mergeWithObservable from "../helpers/mergeWithObservable";
import JourneyActions from "./journeyActions";
import createHistory from "history/createBrowserHistory";

export default (state) => {
  const history = createHistory();

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

  extendObservable(state, emptyState);

  const journeyActions = JourneyActions(state);
  const actions = filterActions(state);

  const reset = action(() => {
    mergeWithObservable(state, emptyState);
    journeyActions.setSelectedJourney(null);
    state.requestedJourneys.clear();

    resetListeners.forEach((cb) => {
      if (typeof cb === "function") {
        cb();
      }
    });
  });

  const selectStopFromUrl = action((location) => {
    const query = new URLSearchParams(location.search);

    if (query.has("stop")) {
      state.stop = query.get("stop");
    }
  });

  selectStopFromUrl(history.location);

  return {
    ...actions,
    reset,
  };
};
