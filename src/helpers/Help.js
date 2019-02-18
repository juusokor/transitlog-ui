import React, {useRef, useEffect, useMemo, useState, useCallback} from "react";
import pick from "lodash/pick";
import {registerTooltip} from "./Tooltip";
import {helpText as translateHelpText} from "./text";

const Help = ({children, rectRef = null, helpText = "This is Help"}) => {
  let hoverRef = useRef(null);
  const observerRef = useRef(null);
  const [rect, setRect] = useState(null);

  if (rectRef) {
    hoverRef = rectRef;
  }

  const translatedText = translateHelpText(helpText);

  const child = useMemo(() => {
    const onlyChild = React.Children.only(children);
    return React.cloneElement(onlyChild, {ref: hoverRef});
  }, [children]);

  const intersectionCallback = useCallback(([entry]) => {
    const currentRect = pick(
      entry.boundingClientRect,
      "top",
      "left",
      "right",
      "bottom"
    );

    console.log(currentRect);
    setRect(currentRect);
  }, []);

  useEffect(() => {
    if (hoverRef.current && hoverRef.current instanceof Element) {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(intersectionCallback, {
          root: null,
        });
      }

      observerRef.current.observe(hoverRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hoverRef.current]);

  useEffect(() => {
    if (rect && translatedText) {
      return registerTooltip(rect, translatedText);
    }
  }, [rect, translatedText]);

  return child;
};

export default Help;
