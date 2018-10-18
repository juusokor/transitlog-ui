import React, {Component} from "react";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import withSelectedJourneyHfp from "../../hoc/withSelectedJourney";
import {combineDateAndTime} from "../../helpers/time";
import {InputBase, ControlGroup} from "../Forms";
import PlusMinusInput from "../PlusMinusInput";
import styled from "styled-components";

const TimeInput = styled(InputBase)`
  text-align: center;
`;

@inject(app("Time"))
@withSelectedJourneyHfp
@observer
class TimeSettings extends Component {
  onTimeButtonClick = (modifier) => (e) => {
    const {
      state: {date, time},
      Time,
    } = this.props;

    const currentTime = combineDateAndTime(date, time, "Europe/Helsinki");
    const nextTime = currentTime.add(modifier, "seconds").format("HH:mm:ss");

    Time.setTime(nextTime);
  };

  render() {
    const {state, Time} = this.props;
    const {time, timeIncrement} = state;

    return (
      <ControlGroup>
        <PlusMinusInput
          onIncrease={this.onTimeButtonClick(timeIncrement)}
          onDecrease={this.onTimeButtonClick(-timeIncrement)}>
          <TimeInput value={time} onChange={(e) => Time.setTime(e.target.value)} />
        </PlusMinusInput>
      </ControlGroup>
    );
  }
}

export default TimeSettings;
