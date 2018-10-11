import React, {Component} from "react";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import withSelectedJourneyHfp from "../../hoc/withSelectedJourneyHfp";
import {combineDateAndTime} from "../../helpers/time";
import {text} from "../../helpers/text";
import {ControlGroup, Button, InputBase} from "../Forms";
import PlusMinusInput from "../PlusMinusInput";
import Input from "../Input";
import styled from "styled-components";

const IncrementValueInput = styled(Input)`
  flex: 0 1 50%;
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
    const {time, timeIncrement, playing} = state;

    return (
      <>
        <ControlGroup>
          <Input animatedLabel={false} label={text("filterpanel.choose_time")}>
            <PlusMinusInput
              onIncrease={this.onTimeButtonClick(timeIncrement)}
              onDecrease={this.onTimeButtonClick(-timeIncrement)}>
              <InputBase
                value={time}
                onChange={(e) => Time.setTime(e.target.value)}
              />
            </PlusMinusInput>
          </Input>
        </ControlGroup>
        <ControlGroup>
          <IncrementValueInput
            label={text("filterpanel.time_increment")}
            type="number"
            max={1000}
            maxLength={4}
            value={timeIncrement}
            onChange={(e) => Time.setTimeIncrement(e.target.value)}
          />
          <Button small onClick={Time.toggleAutoplay}>
            {playing
              ? text("filterpanel.simulate.stop")
              : text("filterpanel.simulate.start")}
          </Button>
        </ControlGroup>
      </>
    );
  }
}

export default TimeSettings;
