import React, {Component} from "react";
import TimeSlider from "./TimeSlider";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import withSelectedJourneyHfp from "../../hoc/withSelectedJourneyHfp";
import get from "lodash/get";
import last from "lodash/last";
import {combineDateAndTime} from "../../helpers/time";
import moment from "moment-timezone";
import {Text, text} from "../../helpers/text";
import {ControlGroup, Button} from "../Forms";
import PlusMinusInput from "../PlusMinusInput";
import {Heading} from "../Typography";
import styled from "styled-components";

const dateToSeconds = (date) => {
  return Math.abs(date.diff(moment(date).startOf("day"), "seconds"));
};

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
    const {state, Time, selectedJourneyHfp = []} = this.props;
    const {time, date, timeIncrement, playing} = state;

    return (
      <>
        <Heading level={3}>
          <Text>filterpanel.choose_time</Text>
        </Heading>
        <ControlGroup>
          <TimeSlider
            value={time}
            date={date}
            onChange={Time.setTime}
            min={
              selectedJourneyHfp.length !== 0
                ? dateToSeconds(
                    moment(get(selectedJourneyHfp, "[0].received_at", 0)).tz(
                      "Europe/Helsinki"
                    )
                  )
                : undefined
            }
            max={
              selectedJourneyHfp.length !== 0
                ? dateToSeconds(
                    moment(get(last(selectedJourneyHfp), "received_at", 0)).tz(
                      "Europe/Helsinki"
                    )
                  )
                : undefined
            }
          />
        </ControlGroup>
        <PlusMinusInput
          value={time}
          onChange={(e) => Time.setTime(e.target.value)}
          onIncrease={this.onTimeButtonClick(timeIncrement)}
          onDecrease={this.onTimeButtonClick(-timeIncrement)}
        />
        <ControlGroup>
          <Button onClick={Time.toggleAutoplay}>
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
