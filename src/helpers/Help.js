import React, {useState} from "react";
import styled from "styled-components";

const HoverWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const HelpContent = styled.div`
  position: absolute;
  top: 0;
  min-width: 10rem;
  min-height: 5rem;
  background: white;
  border-radius: 5px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  transform: translate(0, 100%);
`;

const Help = ({children, helpText = "This is Help"}) => {
  const [showHelp, toggleHelp] = useState(false);

  return (
    <HoverWrapper>
      {children}
      <HelpContent>{helpText}</HelpContent>
    </HoverWrapper>
  );
};

export default Help;
