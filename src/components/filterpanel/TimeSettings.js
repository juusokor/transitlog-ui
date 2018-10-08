import React, {Component} from "react";
import TimeSlider from "./TimeSlider";
import moment from "moment";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import withSelectedJourneyHfp from "../../hoc/withSelectedJourneyHfp";
import get from "lodash/get";
import last from "lodash/last";
import parse from "date-fns/parse";
import diffSeconds from "date-fns/difference_in_seconds";
import startOfDay from "date-fns/start_of_day";
import isValid from "date-fns/is_valid";
import {Text, text} from "../../helpers/text";

const dateToSeconds = (date) => {
  if (!isValid(date)) {
    return;
  }

  return Math.abs(diffSeconds(startOfDay(date), date));
};

@inject(app("Time"))
@withSelectedJourneyHfp
@observer
class TimeSettings extends Component {
  onTimeButtonClick = (modifier) => (e) => {
    const {
      state: {time},
      Time,
    } = this.props;

    const nextTime = moment(time, "HH:mm:ss")
      .add(modifier, "seconds")
      .format("HH:mm:ss");

    Time.setTime(nextTime);
  };

  render() {
    const {state, Time, selectedJourneyHfp = []} = this.props;
    const {time, timeIncrement, playing} = state;

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
            onChange={Time.setTime}
            min={
              selectedJourneyHfp.length !== 0
                ? dateToSeconds(parse(get(selectedJourneyHfp, "[0].received_at", 0)))
                : undefined
            }
            max={
              selectedJourneyHfp.length !== 0
                ? dateToSeconds(
                    parse(get(last(selectedJourneyHfp), "received_at", 0))
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
