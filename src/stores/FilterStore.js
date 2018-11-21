import {extendObservable, action} from "mobx";
import filterActions from "./filterActions";
import mergeWithObservable from "../helpers/mergeWithObservable";
import JourneyActions from "./journeyActions";
import createHistory from "history/createBrowserHistory";

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
};

export default (state, initialState) => {
  extendObservable(state, {...emptyState, ...initialState});

  const journeyActions = JourneyActions(state);
  const actions = filterActions(state);

  const reset = action(() => {
    mergeWithObservable(state, emptyState);
    journeyActions.setSelectedJourney(null);
    state.requestedJourneys.clear();
  });

  return {
    ...actions,
    reset,
  };
};
