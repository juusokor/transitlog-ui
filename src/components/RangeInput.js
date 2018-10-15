import React, {Component} from "react";
import {observer} from "mobx-react";
import styled, {css} from "styled-components";

const SliderThumb = css`
  border: 3px solid var(--blue);
  height: 1.5rem;
  width: 1.5rem;
  margin-top: -0.7rem;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  transition: background-color 0.15s ease-out, transform 0.2s ease-out;
  padding: 0;
  box-sizing: border-box;

  &:hover {
    background: var(--blue);
    transform: scale(1.05);
  }
`;

const SliderTrack = css`
  width: 100%;
  height: 3px;
  padding: 1rem 0;
  box-sizing: content-box;
  cursor: pointer;
  background: var(--blue);
  background-clip: content-box;
`;

const Slider = styled.input.attrs({type: "range", step: 1})`
  -webkit-appearance: none;
  -moz-appearance: none;
  width: 100%;
  height: 35px;
  background: transparent;
  display: block;
  margin: 0;

  &:focus {
    position: relative;
    z-index: 100;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    ${SliderThumb};
  }

  &::-webkit-slider-runnable-track {
    ${SliderTrack};
  }

  &::-moz-range-track {
    ${SliderTrack};
  }

  &::-ms-track {
    ${SliderTrack};
  }

  &::-moz-range-thumb {
    ${SliderThumb};
  }

  &::-ms-thumb {
    ${SliderThumb};
  }

  &:focus {
    outline: none;
  }

  &::-ms-track {
    width: 100%;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }
`;

@observer
class RangeInput extends Component {
  render() {
    const {value, onChange, min, max, className} = this.props;

    const safeVal = !value || isNaN(value) ? 0 : value;

    return (
      <Slider
        className={className}
        min={min}
        max={max}
        value={safeVal}
        onChange={onChange}
      />
    );
  }
}

export default RangeInput;
