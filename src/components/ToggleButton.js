import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";

const Container = styled.label`
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

const ToggleInput = styled.input.attrs({type: "radio"})`
  position: absolute;
  left: -9999px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
`;

const ToggleMarker = styled.div`
  position: absolute;
  top: -1px;
  transform: translate(-1px, 0);
  left: 0;
  width: 30px;
  height: 30px;
  background-color: white;
  border: 1px solid var(--light-grey);
  border-radius: 15px;
  transition: transform 0.1s ease-out;
`;

const ToggleContainer = styled.div`
  position: relative;
  width: 50px;
  height: 30px;
  border: 1px solid var(--grey);
  border-radius: 15px;
  transition: background 0.2s ease-out;

  ${ToggleInput}:checked + & {
    background: var(--blue);
    border-color: var(--blue);

    ${ToggleMarker} {
      border-color: var(--blue);
      transform: translate(20px, 0);
    }
  }
`;

const TextContainer = styled.div`
  flex: 1;
  flex-basis: auto;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
`;

const StyledLabelText = styled.span`
  color: ${({disabled}) => (disabled ? "var(--light-grey)" : "var(--blue)")};
  margin-left: 1rem;
`;

@observer
class ToggleButton extends Component {
  render() {
    const {
      checked,
      name,
      onChange,
      value,
      disabled,
      children,
      label = children,
    } = this.props;

    return (
      <Container>
        <ToggleInput
          name={name}
          onChange={onChange}
          value={value}
          disabled={disabled}
          checked={checked}
        />
        <ToggleContainer checked={checked} disabled={disabled}>
          <ToggleMarker checked={checked} disabled={disabled} />
        </ToggleContainer>
        <TextContainer>
          <StyledLabelText disabled={disabled}>{label}</StyledLabelText>
        </TextContainer>
      </Container>
    );
  }
}

export default ToggleButton;
