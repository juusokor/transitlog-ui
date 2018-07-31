import React, {Component} from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "./DateInput.css";

import "react-datepicker/dist/react-datepicker.css";

export class DateInput extends Component {
  render() {
    const {date, onDateSelected} = this.props;

    return (
      <React.Fragment>
        <DatePicker
          locale="fi-FI"
          dateFormat="YYYY-MM-DD"
          selected={moment(date)}
          onChange={onDateSelected}
          className="calendar"
        />
      </React.Fragment>
    );
  }
}
