import React, {useRef, useEffect, useMemo} from "react";
import pick from "lodash/pick";
import {registerTooltip} from "./Tooltip";

const Help = ({children, rectRef = null, helpText = "This is Help"}) => {
  let hoverRef = useRef(null);

  if (rectRef) {
    hoverRef = rectRef;
  }

  const child = useMemo(() => {
    const onlyChild = React.Children.only(children);
    return React.cloneElement(onlyChild, {ref: hoverRef});
  }, [children]);

  useEffect(() => {
    if (
      hoverRef.current &&
      typeof hoverRef.current.getBoundingClientRect === "function"
    ) {
      const rect = pick(
        hoverRef.current.getBoundingClientRect(),
        "top",
        "left",
        "right",
        "bottom"
      );

      return registerTooltip(rect, helpText);
    }
  }, [hoverRef.current]);

  return child;
};

export default Help;
