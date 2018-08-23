import React, {Component} from "react";
import addSeconds from "date-fns/add_seconds";
import startOfToday from "date-fns/start_of_today";
import format from "date-fns/format";
import diffSeconds from "date-fns/difference_in_seconds";

const MAX = 86399;
const MIN = 15000;

class TimeSlider extends Component {
  getNumericValue = (value = "") => {
    const {max = MAX} = this.props;

    let val;

    if (value) {
      const [hours = 23, minutes = 59, seconds = 0] = value.split(":");
      val = startOfToday();
      val.setHours(hours);
      val.setMinutes(minutes);
      val.setSeconds(seconds);
    } else {
      val = addSeconds(startOfToday(), max);
    }

    return Math.abs(diffSeconds(val, startOfToday()));
  };

  getTimeValue = (value) => {
    const nextDate = addSeconds(startOfToday(), parseInt(value));
    return format(nextDate, "HH:mm:ss");
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
