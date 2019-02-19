import {helpText as translateHelpText} from "../helpers/text";
import {useMemo} from "react";

/**
 * Returns a tooltipProps object with one property; title.
 * Translates the helpText argument with to the languages/help files.
 */

export const useTooltip = (helpText) => {
  const translatedText = useMemo(() => translateHelpText(helpText), [helpText]);
  return {
    title: translatedText,
  };
};
