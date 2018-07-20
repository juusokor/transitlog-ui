import React, {Component} from "react";
import moment from "moment";

class TimeSlider extends Component {
  getNumericValue = (value) => {
    return Math.abs(
      moment(value || "23:59", "HH:mm").diff(moment("00:00", "HH:mm"), "seconds")
    );
  };

  getTimeValue = (value) => {
    return moment("00:00", "HH:mm")
      .add(value, "seconds")
      .format("HH:mm");
  };

  onChange = (e) => {
    const timeValue = this.getTimeValue(e.target.value);
    this.props.onChange(timeValue);
  };

  render() {
    const {value} = this.props;

    return (
      <input
        style={{width: "100%"}}
        type="range"
        min={0}
        max={86400}
        step={1}
        value={this.getNumericValue(value)}
        onChange={this.onChange}
      />
    );
  }
}

export default TimeSlider;
