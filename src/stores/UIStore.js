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
  extendObservable(state, {
    sidePanelVisible: getUrlValue("sidePanelVisible", true),
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
  };
};
