import React, {Component} from "react";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import {getMomentFromDateTime} from "../../helpers/time";
import {InputBase, ControlGroup} from "../Forms";
import PlusMinusInput from "../PlusMinusInput";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import {observable, action, computed} from "mobx";
import {setResetListener} from "../../stores/FilterStore";
import {TIMEZONE} from "../../constants";

const TimeControlGroup = styled(ControlGroup)`
  margin-bottom: 1.25rem;
`;

const TimeInput = styled(InputBase)`
  text-align: center;
  border-color: var(--blue);
  display: block;
  height: calc(2rem + 2px);
`;

@inject(app("Time"))
@observer
class TimeSettings extends Component {
  resetListener = () => {};

  @observable
  timeInput = "";

  // It is necessary to have a separate "dirty" state. If we would consider the input
  // dirty when the timeInput string is empty, the input value would just switch back
  // to the state value which is disorienting if you're clearing the field and
  // trying to write a new value.
  @observable
  isDirty = false;

  @computed
  get displayTime() {
    const {time} = this.props.state;
    // Display either the state value or the local value in the input.
    return this.isDirty ? this.timeInput : time;
  }

  componentDidMount() {
    // Reset the local input state when the app is reset
    this.resetListener = setResetListener(() => {
      this.setTimeValue("", false);
    });
  }

  componentWillUnmount() {
    this.resetListener();
  }

  onTimeButtonClick = (modifier) => () => {
    const {
      state: {date, time},
      Time,
    } = this.props;

    const currentTime = getMomentFromDateTime(date, time, TIMEZONE);
    const nextTime = currentTime.add(modifier, "seconds").format("HH:mm:ss");

    Time.toggleLive(false);
    Time.setTime(nextTime);
  };

  setTimeValue = action((value, dirtyVal = true) => {
    this.timeInput = value;
    this.isDirty = dirtyVal;
  });

  onKeyDown = (e) => {
    // Blur the input if enter (13) or esc (27) is pressed.
    if (e.keyCode === 27 || e.keyCode === 13) {
      e.target.blur();
    }
  };

  onFocus = () => {
    const {Time, state} = this.props;

    if (state.live) {
      Time.toggleLive(false);
    }
  };

  onBlur = () => {
    const {Time} = this.props;
    // Get the current input value and remove non-number characters.
    const timeValue = this.timeInput.replace(/([^0-9])+/g, "");

    // Get the time string pieces and trim (although that shouldn't be necessary after the regexp).
    // Default to "00".
    let hours = timeValue.slice(0, 2).trim() || "00";
    let minutes = timeValue.slice(2, 4).trim() || "00";
    let seconds = timeValue.slice(4, 6).trim() || "00";

    // Sanity check hours. Since we initially took two digits for the hours, it may
    // be that the second digit is supposed to belong to the minutes. Just assign
    // one digit to the hours in this case. Also re-parse the other time units.
    if (parseInt(hours, 10) > 23) {
      hours = timeValue.slice(0, 1).trim() || "0";
      minutes = timeValue.slice(1, 3).trim() || "00";
      seconds = timeValue.slice(3, 5).trim() || "00";
    }

    // Pad the string with a zero at the end IF the string is one character long.
    function padStart(val) {
      return val.length < 2 ? doubleDigit(val, true) : val;
    }

    // Sanity check minutes.
    if (parseInt(padStart(minutes), 10) > 59) {
      minutes = "59";
    }

    // Sanity check seconds.
    if (parseInt(padStart(seconds), 10) > 59) {
      seconds = "59";
    }

    // Make it into a valid time string
    const nextTimeVal = `${doubleDigit(hours)}:${padStart(minutes)}:${padStart(
      seconds
    )}`;

    // Assign it to the state for stuff to happen
    Time.setTime(nextTimeVal);
    // Clear the local state and set it as not dirty to show the state value in the input.
    this.setTimeValue("", false);
  };

  render() {
    const {state} = this.props;
    const {timeIncrement} = state;

    return (
      <TimeControlGroup>
        <PlusMinusInput
          onIncrease={this.onTimeButtonClick(timeIncrement)}
          onDecrease={this.onTimeButtonClick(-timeIncrement)}>
          <TimeInput
            value={this.displayTime}
            onBlur={this.onBlur}
            onFocus={this.onFocus}
            onKeyDown={this.onKeyDown}
            onChange={(e) => this.setTimeValue(e.target.value, true)}
          />
        </PlusMinusInput>
      </TimeControlGroup>
    );
  }
}

export default TimeSettings;
