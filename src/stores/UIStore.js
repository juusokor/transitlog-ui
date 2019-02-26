import {extendObservable, observable, reaction} from "mobx";
import {getUrlValue} from "./UrlManager";
import {createRouteId} from "../helpers/keys";
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

export default (state) => {
  extendObservable(state, {
    sidePanelVisible: getUrlValue("sidePanelVisible", true),
    journeyDetailsOpen: getUrlValue("journeyDetailsOpen", true),
    mapOverlays: getUrlValue("mapOverlays", "").split(","),
    areaEventsStyle: getUrlValue("areaEventsStyle", areaEventsStyles.MARKERS),
    highlightedStop: "",
    language: languageState.language,
    errors: [],
    shareModalOpen: false,
    // This is a computed check to see if we have anything to show in the journey details sidebar.
    // When this returns false the sidebar will hide regardless of the journeyDetailsOpen setting.
    get journeyDetailsCanOpen() {
      // Make sure the route of the selected journey matches the currently selected route.
      // Otherwise the journey details can open even though the user has not made a selection.
      return !!(
        createRouteId(state.route) === createRouteId(state.selectedJourney) &&
        state.selectedJourney
      );
    },
    get journeyDetailsAreOpen() {
      return state.journeyDetailsCanOpen && state.journeyDetailsOpen;
    },
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
