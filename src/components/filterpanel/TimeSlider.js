import React, {Component} from "react";
import moment from "moment-timezone";

const MAX = 86399;
const MIN = 15000;

class TimeSlider extends Component {
  getNumericValue = (value = "") => {
    const {max = MAX} = this.props;

    const val = moment.tz("Europe/Helsinki").startOf("day");

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
        .tz("Europe/Helsinki")
        .startOf("day")
        .diff(val, "seconds")
    );
  };

  getTimeValue = (value) => {
    const nextDate = moment
      .tz("Europe/Helsinki")
      .startOf("day")
      .add(parseInt(value, 10), "seconds");

    return nextDate.format("HH:mm:ss");
  };

  onChange = (e) => {
    const timeValue = this.getTimeValue(e.target.value);
    this.props.onChange(timeValue);
  };

  render() {
    const {value, min = MIN, max = MAX} = this.props;

    return (
      <input
        style={{width: "100%"}}
        type="range"
        min={min}
        max={max}
        step={1}
        value={this.getNumericValue(value)}
        onChange={this.onChange}
      />
    );
  }
}

export default TimeSlider;
