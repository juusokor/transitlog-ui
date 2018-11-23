import React, {Component} from "react";
import moment from "moment-timezone";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import RangeInput from "../RangeInput";

export const TIME_SLIDER_MAX = 86399;
export const TIME_SLIDER_MIN = 15000;

@inject(app("Time"))
@observer
class TimeSlider extends Component {
  getNumericValue = (value = "", date) => {
    const {max = TIME_SLIDER_MAX} = this.props;

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

  getTimeValue = (value, date) => {
    const nextDate = moment
      .tz(date, "Europe/Helsinki")
      .startOf("day")
      .add(parseInt(value, 10), "seconds");

    return nextDate.format("HH:mm:ss");
  };

  onChange = (e) => {
    const {
      Time,
      state: {date},
    } = this.props;

    const timeValue = this.getTimeValue(e.target.value, date);
    Time.setTime(timeValue);
  };

  render() {
    const {
      className,
      state: {date, time},
      min = TIME_SLIDER_MIN,
      max = TIME_SLIDER_MAX,
    } = this.props;

    return (
      <div className={className}>
        <RangeInput
          value={this.getNumericValue(time, date)}
          min={min}
          max={max}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

export default TimeSlider;
