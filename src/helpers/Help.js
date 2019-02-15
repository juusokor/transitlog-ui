import React, {useRef, useEffect} from "react";
import styled from "styled-components";
import pick from "lodash/pick";
import {registerTooltip} from "./Tooltip";

const HoverArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Help = ({children, helpText = "This is Help"}) => {
  const hoverRef = useRef(null);

  useEffect(() => {
    if (hoverRef.current) {
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

  return (
    <>
      <HoverArea ref={hoverRef} />
      {children}
    </>
  );
};

export default Help;
