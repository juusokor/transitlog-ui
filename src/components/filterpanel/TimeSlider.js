import React, {Component} from "react";
import moment from "moment-timezone";
import styled, {css} from "styled-components";

const MAX = 86399;
const MIN = 15000;

const SliderThumb = css`
  border: 3px solid var(--blue);
  height: 1.5rem;
  width: 1.5rem;
  margin-top: -0.7rem;
  border-radius: 50%;
  background: white;
  cursor: pointer;
`;

const SliderTrack = css`
  width: 100%;
  height: 3px;
  cursor: pointer;
  background: var(--blue);
`;

const Slider = styled.input.attrs({type: "range", step: 1})`
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
  padding-top: 1rem;
  display: block;

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

class TimeSlider extends Component {
  getNumericValue = (value = "", date) => {
    const {max = MAX} = this.props;

    const val = moment.tz(date, "Europe/Helsinki").startOf("day");

    if (value) {
      const [hours = 23, minutes = 59, seconds = 0] = value.split(":");
      val.hours(hours);
      val.minutes(minutes);
      val.seconds(seconds);
    } else {
      val.add(max, "seconds");
    }

    return Math.abs(
      moment
        .tz(date, "Europe/Helsinki")
        .startOf("day")
        .diff(val, "seconds")
    );
  };

  getTimeValue = (value) => {
    const {date} = this.props;

    const nextDate = moment
      .tz(date, "Europe/Helsinki")
      .startOf("day")
      .add(parseInt(value, 10), "seconds");

    return nextDate.format("HH:mm:ss");
  };

  onChange = (e) => {
    const timeValue = this.getTimeValue(e.target.value);
    this.props.onChange(timeValue);
  };

  render() {
    const {value, date, min = MIN, max = MAX} = this.props;

    return (
      <Slider
        min={min}
        max={max}
        value={this.getNumericValue(value, date)}
        onChange={this.onChange}
      />
    );
  }
}

export default TimeSlider;
