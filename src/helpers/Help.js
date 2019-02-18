import React, {useRef, useEffect, useMemo} from "react";
import pick from "lodash/pick";
import {registerTooltip} from "./Tooltip";
import {helpText as translateHelpText} from "./text";

const Help = ({children, rectRef = null, helpText = "This is Help"}) => {
  let hoverRef = useRef(null);

  if (rectRef) {
    hoverRef = rectRef;
  }

  const translatedText = translateHelpText(helpText);

  const child = useMemo(() => {
    const onlyChild = React.Children.only(children);
    return React.cloneElement(onlyChild, {ref: hoverRef});
  }, [children]);

  useEffect(() => {
    if (
      hoverRef.current &&
      typeof hoverRef.current.getBoundingClientRect === "function" &&
      translatedText
    ) {
      const rect = pick(
        hoverRef.current.getBoundingClientRect(),
        "top",
        "left",
        "right",
        "bottom"
      );

      return registerTooltip(rect, translatedText);
    }
  }, [hoverRef.current, translatedText]);

  return child;
};

export default Help;
