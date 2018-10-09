import React, {Component} from "react";
import {observer} from "mobx-react";
import {Input, ControlGroup, Button} from "./Forms";
import styled from "styled-components";

const PlusMinusButton = styled(Button)`
  display: inline-block;
  border-radius: ${({side}) => (side === "right" ? "0 5px 5px 0" : "5px 0 0 5px")};
  padding: 0.5rem;
`;

@observer
class PlusMinusInput extends Component {
  render() {
    const {
      value,
      onChange,
      onIncrease,
      onDecrease,
      type,
      max,
      maxLength,
      min,
      className,
    } = this.props;

    return (
      <ControlGroup className={className}>
        <PlusMinusButton side="left" onClick={onDecrease}>
          -
        </PlusMinusButton>
        <Input
          value={value}
          onChange={onChange}
          type={type}
          max={max}
          min={min}
          maxLength={maxLength}
        />
        <PlusMinusButton side="right" onClick={onIncrease}>
          +
        </PlusMinusButton>
      </ControlGroup>
    );
  }
}

export default PlusMinusInput;
