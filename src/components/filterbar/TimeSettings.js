import React, {Component} from "react";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import {combineDateAndTime} from "../../helpers/time";
import {InputBase, ControlGroup} from "../Forms";
import PlusMinusInput from "../PlusMinusInput";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import {observable, action, computed} from "mobx";

const TimeInput = styled(InputBase)`
  text-align: center;
  border-color: var(--blue);
  display: block;
  height: calc(2rem + 2px);
`;

@inject(app("Time"))
@observer
class TimeSettings extends Component {
  @observable
  timeInput = "";

  @observable
  isDirty = false;

  @computed
  get displayTime() {
    const {time} = this.props.state;
    return this.isDirty ? this.timeInput : time;
  }

  onTimeButtonClick = (modifier) => () => {
    const {
      state: {date, time},
      Time,
    } = this.props;

    const currentTime = combineDateAndTime(date, time, "Europe/Helsinki");
    const nextTime = currentTime.add(modifier, "seconds").format("HH:mm:ss");

    Time.setTime(nextTime);
  };

  setTimeValue = action((value, dirtyVal = true) => {
    this.timeInput = value;
    this.isDirty = dirtyVal;
  });

  onBlur = () => {
    const {Time} = this.props;
    const timeValue = this.timeInput.replace(/([^0-9])+/g, "");

    let hours = timeValue.slice(0, 2).trim() || "00";
    let minutes = timeValue.slice(2, 4).trim() || "00";

    if (parseInt(hours, 10) > 23) {
      hours = timeValue.slice(0, 1).trim() || "0";
      minutes = timeValue.slice(1, 3).trim() || "00";
    }

    function padMinutes(min) {
      return min.length < 2 ? doubleDigit(min, true) : min;
    }

    if (parseInt(padMinutes(minutes), 10) > 59) {
      minutes = "59";
    }

    const nextTimeVal = `${doubleDigit(hours)}:${padMinutes(minutes)}:00`;

    Time.setTime(nextTimeVal, true);
    this.setTimeValue("", false);
  };

  render() {
    const {state} = this.props;
    const {timeIncrement} = state;

    return (
      <ControlGroup>
        <PlusMinusInput
          onIncrease={this.onTimeButtonClick(timeIncrement)}
          onDecrease={this.onTimeButtonClick(-timeIncrement)}>
          <TimeInput
            value={this.displayTime}
            onBlur={this.onBlur}
            onChange={(e) => this.setTimeValue(e.target.value, true)}
          />
        </PlusMinusInput>
      </ControlGroup>
    );
  }
}

export default TimeSettings;
