import {extendObservable, observable, reaction} from "mobx";
import {getUrlValue} from "./UrlManager";
import uiActions from "./uiActions";

export const LANGUAGES = {
  FINNISH: "fi",
  ENGLISH: "en",
  SWEDISH: "se",
};

// Language state is external because there are some parts of the app
// that use it that are outside the the scope of the React tree.
export const languageState = observable({
  language: getUrlValue("language", "fi"),
});

export const areaEventsStyles = {
  MARKERS: "markers",
  POLYLINES: "polylines",
};

export const weeklyObservedTimeTypes = {
  LAST_STOP_ARRIVAL: "arrival",
  FIRST_STOP_DEPARTURE: "departure",
};

export default (state) => {
  extendObservable(state, {
    sidePanelVisible: getUrlValue("sidePanelVisible", true),
    journeyDetailsOpen: getUrlValue("journeysDetailsOpen", true),
    journeyGraphOpen: getUrlValue("journeyGraphOpen", false),
    mapOverlays: getUrlValue("mapOverlays", "").split(","),
    areaEventsStyle: getUrlValue("areaEventsStyle", areaEventsStyles.MARKERS),
    weeklyObservedTimes: getUrlValue(
      "weeklyObservedTimes",
      weeklyObservedTimeTypes.FIRST_STOP_DEPARTURE
    ),
    highlightedStop: "",
    language: languageState.language,
    errors: [],
    shareModalOpen: false,
  });

  const actions = uiActions(state);

  // Sync external languageState with app state.
  reaction(
    () => languageState.language,
    (currentLanguage) => {
      state.language = currentLanguage;
    }
  );

  return actions;
};
