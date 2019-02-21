import {observer} from "mobx-react";
import {languageState} from "../stores/UIStore";
import {get} from "lodash";

const uiFiles = {
  fi: require("../languages/ui/fi.json"),
  se: require("../languages/ui/se.json"),
  en: require("../languages/ui/en.json"),
};

const helpFiles = {
  fi: require("../languages/help/fi.json"),
  se: require("../languages/help/se.json"),
  en: require("../languages/help/en.json"),
};

function getTextForToken(token, files) {
  const languageFile = get(files, languageState.language, false);

  if (!languageFile) {
    console.error("No language file found for language: " + languageState.language);
  }

  const languageStr = languageFile[token];

  if (!languageStr) {
    return token;
  }

  return languageStr;
}

export function helpText(text) {
  return getTextForToken(text, helpFiles);
}

export function text(token) {
  return getTextForToken(token, uiFiles);
}

export const Text = observer(({children, text: textToken = children}) => {
  const str = text(textToken);
  return str;
});
