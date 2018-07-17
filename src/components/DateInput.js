import React, {Component} from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "./DateInput.css";

import "react-datepicker/dist/react-datepicker.css";

export class DateInput extends Component {
  render() {
    return (
      <DatePicker
        selected={moment(this.props.date)}
        onChange={(date) => this.props.onDateSelected(date.format("YYYY-MM-DD"))}
        className="calendar"
      />
    );
  }
}
