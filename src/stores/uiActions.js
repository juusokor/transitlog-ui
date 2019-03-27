import {action} from "mobx";
import {setUrlValue} from "./UrlManager";
import {LANGUAGES, languageState, areaEventsStyles} from "./UIStore";

export default (state) => {
  const toggleShareModal = action((setTo = !state.shareModalOpen) => {
    state.shareModalOpen = setTo;
  });

  const toggleSidePanel = action((setTo = !state.sidePanelVisible) => {
    state.sidePanelVisible = !!setTo;
    setUrlValue("sidePanelVisible", state.sidePanelVisible);
  });

  const toggleJourneyDetails = action((setTo = !state.journeyDetailsOpen) => {
    state.journeyDetailsOpen = !!setTo;
    setUrlValue("journeyDetailsOpen", state.journeyDetailsOpen);
  });

  const toggleJourneyGraph = action((setTo = !state.journeyGraphOpen) => {
    state.journeyGraphOpen = !!setTo;
  });

  const hideJourneyGraph = action(() => {
    state.journeyGraphOpen = false;
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

  const highlightStop = action((stopId) => {
    state.highlightedStop = stopId;
  });

  return {
    toggleSidePanel,
    toggleJourneyDetails,
    toggleJourneyGraph,
    hideJourneyGraph,
    setLanguage,
    changeOverlay,
    addError,
    removeError,
    setAreaEventsStyle,
    toggleShareModal,
    highlightStop,
  };
};
