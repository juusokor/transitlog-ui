import {helpText as translateHelpText} from "../helpers/text";
import {useMemo} from "react";

export const useTooltip = (helpText) => {
  const translatedText = useMemo(() => translateHelpText(helpText), [helpText]);
  return {
    title: translatedText,
  };
};
