import React from "react";
import {Button, InputBase} from "./Forms";
import styled from "styled-components";
import PlusIcon from "../icons/Plus";
import MinusIcon from "../icons/Minus";
import Tooltip from "./Tooltip";
import {useTooltip} from "../hooks/useTooltip";

const PlusMinusButton = styled(Button)`
  display: inline-block;
  border-radius: ${({side}) => (side === "right" ? "0 5px 5px 0" : "5px 0 0 5px")};
  padding: 0 1rem;
  ${({side}) => (side === "right" ? "margin-left: -3px" : "margin-right: -3px")};
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;

  > div,
  > input {
    position: relative;
    z-index: 5;
  }

  ${InputBase} {
    border-color: var(--blue);
    position: relative;
    z-index: 1;
  }
`;

const PlusMinusInput = React.forwardRef((props, ref) => {
  const {
    onIncrease,
    onDecrease,
    className,
    children,
    plusLabel = <PlusIcon fill="white" width={15} />,
    minusLabel = <MinusIcon fill="white" width={15} />,
    plusHelp = "",
    minusHelp = "",
  } = props;

  const plusButtonTooltip = useTooltip(plusHelp);
  const minusButtonTooltip = useTooltip(minusHelp);

  return (
    <Wrapper className={className} ref={ref}>
      <PlusMinusButton
        small
        primary
        side="left"
        onClick={onDecrease}
        {...minusButtonTooltip}>
        {minusLabel}
      </PlusMinusButton>
      {children}
      <PlusMinusButton
        small
        primary
        side="right"
        onClick={onIncrease}
        {...plusButtonTooltip}>
        {plusLabel}
      </PlusMinusButton>
    </Wrapper>
  );
});

export default PlusMinusInput;
