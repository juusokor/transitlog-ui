import React from "react";
import styled from "styled-components";
import {useToggle} from "../hooks/useToggle";

const ToggleViewWrapper = styled.div``;

const ToggleButton = styled.button`
  display: block;
  padding: 0;
  background: transparent;
  border: 0;
  font-family: inherit;
  text-decoration: underline dashed;
  color: var(--blue);
  cursor: pointer;
  outline: none;
  text-align: left;
  width: auto;

  > * {
    transition: all 0.1s ease-out;
  }

  &:hover > * {
    transform: scale(1.025);
  }
`;

const ToggleView = ({
  children,
  className,
  label = "Toggle",
  closedLabel = label,
  openLabel = label,
}) => {
  const [open, toggleOpen] = useToggle(false);

  return (
    <ToggleViewWrapper className={className}>
      <ToggleButton onClick={() => toggleOpen()}>
        {open ? openLabel : closedLabel}
      </ToggleButton>
      {open ? children : null}
    </ToggleViewWrapper>
  );
};

export default ToggleView;
