import React, {Component} from "react";
import {observer} from "mobx-react";
import {Button, InputBase} from "./Forms";
import styled from "styled-components";

const PlusMinusButton = styled(Button)`
  display: inline-block;
  border-radius: ${({side}) => (side === "right" ? "0 5px 5px 0" : "5px 0 0 5px")};
  padding: 0.5rem 1rem;
  ${({side}) => (side === "right" ? "margin-left: -3px" : "margin-right: -3px")};
  flex: 1 1 auto;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;

  > div {
    position: relative;
    z-index: 1;
  }

  ${InputBase} {
    border-color: var(--blue);
  }
`;

@observer
class PlusMinusInput extends Component {
  render() {
    const {
      onIncrease,
      onDecrease,
      className,
      children,
      plusLabel = "+",
      minusLabel = "-",
    } = this.props;

    return (
      <Wrapper className={className}>
        <PlusMinusButton small primary side="left" onClick={onDecrease}>
          {minusLabel}
        </PlusMinusButton>
        {children}
        <PlusMinusButton small primary side="right" onClick={onIncrease}>
          {plusLabel}
        </PlusMinusButton>
      </Wrapper>
    );
  }
}

export default PlusMinusInput;
