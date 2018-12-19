import {extendObservable, action, observable, reaction} from "mobx";
import {getUrlValue, setUrlValue} from "./UrlManager";

export const LANGUAGES = {
  FINNISH: "fi",
  ENGLISH: "en",
  SWEDISH: "se",
};

export const languageState = observable({
  language: getUrlValue("language", "fi"),
});

export default (state) => {
  const sideBarUrlState = getUrlValue("sidePanelVisible", true);

  extendObservable(state, {
    sidePanelVisible: !sideBarUrlState || sideBarUrlState === "false" ? false : true,
    mapOverlays: getUrlValue("mapOverlays", "").split(","),
    language: languageState.language,
  });

  const toggleSidePanel = action((setTo = !state.sidePanelVisible) => {
    state.sidePanelVisible = setTo;
    setUrlValue("sidePanelVisible", state.sidePanelVisible);
  });

  const setLanguage = action((language) => {
    if (Object.values(LANGUAGES).includes(language)) {
      languageState.language = language;
      setUrlValue("language", languageState.language);
    }
  });

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
    toggleSidePanel,
    setLanguage,
    changeOverlay,
  };
};
