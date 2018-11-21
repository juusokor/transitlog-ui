import {extendObservable, action} from "mobx";
import filterActions from "./filterActions";
import mergeWithObservable from "../helpers/mergeWithObservable";
import JourneyActions from "./journeyActions";
import {inflate} from "../helpers/inflate";
import pick from "lodash/pick";
import merge from "lodash/merge";

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
  extendObservable(
    state,
    merge(emptyState, pick(inflate(initialState), ...Object.keys(emptyState)))
  );

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
