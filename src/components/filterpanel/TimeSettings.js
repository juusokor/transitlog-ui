import React, {Component} from "react";
import TimeSlider from "./TimeSlider";
import moment from "moment";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";

@inject(app("Time"))
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
    const {state, Time} = this.props;
    const {time, timeIncrement, playing} = state;

    return (
      <div>
        <p>
          <label>Choose time</label>
        </p>
        <p>
          <TimeSlider value={time} onChange={Time.setTime} />
        </p>
        <p className="control-group">
          <button onClick={this.onTimeButtonClick(-timeIncrement)}>
            &lsaquo; {timeIncrement} sek.
          </button>
          <input value={time} onChange={(e) => Time.setTime(e.target.value)} />
          <button onClick={this.onTimeButtonClick(timeIncrement)}>
            &rsaquo; {timeIncrement} sek.
          </button>
          <input
            type="number"
            max={1000}
            maxLength={4}
            value={timeIncrement}
            onChange={Time.setTimeIncrement}
          />
        </p>
        <p>
          <button onClick={Time.toggleAutoplay}>
            {playing ? "Pysäytä simulaatio" : "Simuloi"}
          </button>
        </p>
      </div>
    );
  }
}

export default TimeSettings;
