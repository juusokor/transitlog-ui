import {extendObservable, action, observable, reaction} from "mobx";
import {getUrlValue, setUrlValue} from "./UrlManager";
import getJourneyId from "../helpers/getJourneyId";
import {createRouteId} from "../helpers/keys";

export const LANGUAGES = {
  FINNISH: "fi",
  ENGLISH: "en",
  SWEDISH: "se",
};

export const languageState = observable({
  language: getUrlValue("language", "fi"),
});

export const areaEventsStyles = {
  MARKERS: "markers",
  POLYLINES: "polylines",
};

export default (state) => {
  const sideBarUrlState = getUrlValue("sidePanelVisible", true);
  const journeyDetailsUrlState = getUrlValue("journeyDetailsOpen", true);

  extendObservable(state, {
    sidePanelVisible: !sideBarUrlState || sideBarUrlState === "false" ? false : true,
    journeyDetailsOpen:
      !journeyDetailsUrlState || journeyDetailsUrlState === "false" ? false : true,
    mapOverlays: getUrlValue("mapOverlays", "").split(","),
    areaEventsStyle: getUrlValue("areaEventsStyle", areaEventsStyles.MARKERS),
    language: languageState.language,
    errors: [],
    shareModalOpen: false,
    pollingEnabled: getUrlValue("pollingEnabled", false),
    // This is a computed check to see if we have anything to show in the journey details sidebar.
    // When this returns false the sidebar will hide regardless of the journeyDetailsOpen setting.
    get journeyDetailsCanOpen() {
      // Make sure the route of the selected journey matches the currently selected route.
      // Otherwise the journey details can open even though the user has not made a selection.
      return !!(
        createRouteId(state.route) === createRouteId(state.selectedJourney) &&
        getJourneyId(state.selectedJourney)
      );
    },
    get journeyDetailsAreOpen() {
      return state.journeyDetailsCanOpen && state.journeyDetailsOpen;
    },
  });

  const toggleShareModal = action((setTo = !state.shareModalOpen) => {
    state.shareModalOpen = setTo;
  });

  const togglePolling = action((setTo = !state.pollingEnabled) => {
    state.pollingEnabled = setTo;
    setUrlValue("pollingEnabled", state.pollingEnabled);
  });

  const toggleSidePanel = action((setTo = !state.sidePanelVisible) => {
    state.sidePanelVisible = !!setTo;
    setUrlValue("sidePanelVisible", state.sidePanelVisible);
  });

  const toggleJourneyDetails = action((setTo = !state.journeyDetailsOpen) => {
    state.journeyDetailsOpen = !!setTo;
    setUrlValue("journeyDetailsOpen", state.journeyDetailsOpen);
  });

  const setLanguage = action((language) => {
    if (Object.values(LANGUAGES).includes(language)) {
      languageState.language = language;
      setUrlValue("language", languageState.language);
    }
  });

  const setAreaEventsStyle = action((style = areaEventsStyles.MARKERS) => {
    if (Object.values(areaEventsStyles).indexOf(style) !== -1) {
      state.areaEventsStyle = style;
      setUrlValue("areaEventsStyle", state.areaEventsStyle);
    }
  });

  const addError = (type, message) => {
    if (!type || !message) {
      return;
    }

    const error = {
      type,
      message,
      code: `${type}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    state.errors.push(error);
  };

  const removeError = (errorCode) => {
    const errorIdx = state.errors.findIndex((err) => err.code === errorCode);

    if (errorIdx !== -1) {
      state.errors.splice(errorIdx, 1);
    }
  };

  const changeOverlay = (changeAction) =>
    action(({name}) => {
      const overlays = state.mapOverlays;

      if (changeAction === "remove") {
        /* TODO: fix this
        // Be sure to hide the Mapillary viewer if the mapillary layer was turned off.
        if( name === "Mapillary" ) {
          this.props.setMapillaryViewerLocation(false);
        }*/

        const idx = overlays.indexOf(name);

        if (idx !== -1) {
          overlays.splice(idx, 1);
        }
      } else if (changeAction === "add") {
        overlays.push(name);
      }

      setUrlValue(
        "mapOverlays",
        overlays.length !== 0 ? overlays.filter((name) => !!name).join(",") : null
      );

      state.mapOverlays.replace(overlays);
    });

  // Sync external languageState with app state.
  reaction(
    () => languageState.language,
    (currentLanguage) => {
      state.language = currentLanguage;
    }
  );

  return {
    toggleShareModal,
    togglePolling,
    toggleSidePanel,
    toggleJourneyDetails,
    setLanguage,
    changeOverlay,
    addError,
    removeError,
    setAreaEventsStyle,
  };
};
