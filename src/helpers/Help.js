import React, {useRef, useEffect, useMemo, useState} from "react";
import pick from "lodash/pick";
import {registerTooltip} from "./Tooltip";
import {helpText as translateHelpText} from "./text";

const Help = ({children, rectRef = null, helpText = "This is Help"}) => {
  let hoverRef = useRef(null);
  const [rect, setRect] = useState(null);

  if (rectRef) {
    hoverRef = rectRef;
  }

  const translatedText = translateHelpText(helpText);

  const child = useMemo(() => {
    const onlyChild = React.Children.only(children);
    return React.cloneElement(onlyChild, {ref: hoverRef});
  }, [children]);

  useEffect(() => {
    if (hoverRef.current && hoverRef.current instanceof Element) {
      const currentRect = pick(
        hoverRef.current.getBoundingClientRect(),
        "top",
        "left",
        "right",
        "bottom"
      );

      setRect(currentRect);
    }
  }, [hoverRef.current]);

  useEffect(() => {
    if (rect && translatedText) {
      return registerTooltip(rect, translatedText);
    }
  }, [rect, translatedText]);

  return child;
};

export default Help;
