import React from "react";
import {observer} from "mobx-react";
import {languageState} from "../stores/UIStore";
import {get} from "lodash";

const languageFiles = {
  fi: require("../languages/fi.json"),
  se: require("../languages/se.json"),
  en: require("../languages/en.json"),
};

export function text(token) {
  const languageFile = get(languageFiles, languageState.language, false);

  if (!languageFile) {
    console.error("No language file found for language: " + languageState.language);
  }

  const languageStr = languageFile[token];

  if (!languageStr) {
    return token;
  }

  return languageStr;
}

export const Text = observer((props) => {
  const str = text(props.text);
  return str;
});
