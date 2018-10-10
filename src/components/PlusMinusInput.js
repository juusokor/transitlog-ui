import React, {Component} from "react";
import {observer} from "mobx-react";
import {Button} from "./Forms";
import styled from "styled-components";

const PlusMinusButton = styled(Button)`
  display: inline-block;
  border-radius: ${({side}) => (side === "right" ? "0 5px 5px 0" : "5px 0 0 5px")};
  padding: 0.5rem 1rem;
  height: 2.5rem;
  ${({side}) => (side === "right" ? "margin-left: -3px" : "margin-right: -3px")};
  position: relative;
  z-index: 0;
  flex: 0;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;

@observer
class PlusMinusInput extends Component {
  render() {
    const {onIncrease, onDecrease, className, children} = this.props;

    return (
      <Wrapper className={className}>
        <PlusMinusButton primary side="left" onClick={onDecrease}>
          -
        </PlusMinusButton>
        {children}
        <PlusMinusButton primary side="right" onClick={onIncrease}>
          +
        </PlusMinusButton>
      </Wrapper>
    );
  }
}

export default PlusMinusInput;
