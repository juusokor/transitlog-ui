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
      <div>
        <p>
          <label>
            <Text>filterpanel.choose_time</Text>
          </label>
        </p>
        <p>
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
        </p>
        <p className="control-group">
          <button onClick={this.onTimeButtonClick(-timeIncrement)}>
            &lsaquo; {timeIncrement} <Text>general.seconds.short</Text>
          </button>
          <input value={time} onChange={(e) => Time.setTime(e.target.value)} />
          <button onClick={this.onTimeButtonClick(timeIncrement)}>
            &rsaquo; {timeIncrement} <Text>general.seconds.short</Text>
          </button>
          <input
            type="number"
            max={1000}
            maxLength={4}
            value={timeIncrement}
            onChange={(e) => Time.setTimeIncrement(e.target.value)}
          />
        </p>
        <p>
          <button onClick={Time.toggleAutoplay}>
            {playing
              ? text("filterpanel.simulate.stop")
              : text("filterpanel.simulate.start")}
          </button>
        </p>
      </div>
    );
  }
}

export default TimeSettings;
