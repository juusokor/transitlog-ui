import {extendObservable, action, observable, reaction} from "mobx";

export const LANGUAGES = {
  FINNISH: "fi",
  ENGLISH: "en",
  SWEDISH: "se",
};

export const languageState = observable({
  language: "fi",
});

export default (state) => {
  extendObservable(state, {
    filterPanelVisible: true,
    language: languageState.language,
  });

  const toggleFilterPanel = action((setTo = !state.filterPanelVisible) => {
    state.filterPanelVisible = setTo;
  });

  const setLanguage = action((language) => {
    if (Object.values(LANGUAGES).includes(language)) {
      languageState.language = language;
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
    toggleFilterPanel,
    setLanguage,
  };
};
