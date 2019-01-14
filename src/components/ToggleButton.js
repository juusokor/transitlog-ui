import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";

const Container = styled.label`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: nowrap;
  position: relative;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

const ToggleInput = styled.input`
  position: absolute;
  left: -9999px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
`;

const ToggleMarker = styled.div`
  position: absolute;
  top: 1px;
  left: 0;
  width: 16px;
  height: 16px;
  background-color: ${({checked}) => (!checked ? "#aaa" : "white")};
  border: 1px solid ${({checked}) => (!checked ? "transparent" : "var(--blue)")};
  border-radius: 15px;
  transition: transform 0.1s ease-out;
  transform: translate(1px, 0);
`;

const ToggleContainer = styled.div`
  position: relative;
  width: 35px;
  height: 20px;
  border: 1px solid ${({isSwitch}) => (isSwitch ? "var(--blue)" : "var(--grey)")};
  background: ${({isSwitch}) => (isSwitch ? "var(--blue)" : "white")};
  border-radius: 15px;
  transition: background 0.2s ease-out;
  flex: 0 0 35px;

  ${ToggleInput}:checked + & {
    background: var(--blue);
    border-color: var(--blue);

    ${ToggleMarker} {
      transform: translate(16px, 0);
    }
  }
`;

const TextContainer = styled.div`
  font-family: var(--font-family);
  flex: 1 1 40%;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  color: ${({disabled}) => (disabled ? "var(--light-grey)" : "var(--blue)")};
  margin-left: ${({isPreLabel = false}) => (isPreLabel ? "0" : "1rem")};
  margin-right: ${({isPreLabel = false}) => (isPreLabel ? "1rem" : "0")};
  text-align: ${({isPreLabel = false}) => (isPreLabel ? "right" : "left")};
  font-size: 0.875rem;
`;

@observer
class ToggleButton extends Component {
  render() {
    const {
      type = "radio",
      checked,
      name,
      onChange,
      value,
      disabled,
      isSwitch = false,
      children,
      label = children,
      preLabel,
      className,
    } = this.props;

    return (
      <Container className={className}>
        {preLabel && <TextContainer isPreLabel={true}>{preLabel}</TextContainer>}
        <ToggleInput
          type={type}
          name={name}
          onChange={onChange}
          value={value}
          disabled={disabled}
          checked={checked}
        />
        <ToggleContainer isSwitch={isSwitch} checked={checked} disabled={disabled}>
          <ToggleMarker
            checked={!checked ? isSwitch : checked}
            disabled={disabled}
          />
        </ToggleContainer>
        <TextContainer>{label}</TextContainer>
      </Container>
    );
  }
}

export default ToggleButton;
