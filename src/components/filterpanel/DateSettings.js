import React, {Component} from "react";
import {DateInput} from "./DateInput";
import moment from "moment";

class DateSettings extends Component {
  onDateButtonClick = (modifier) => () => {
    const {queryDate, onDateSelected} = this.props;

    const nextDate = moment(queryDate, "YYYY-MM-DD")
      .add(modifier, "days")
      .format("YYYY-MM-DD");

    onDateSelected(nextDate);
  };

  render() {
    const {onDateSelected, queryDate} = this.props;

    return (
      <div>
        <p>
          <label>Choose date</label>
        </p>
        <div className="date-input">
          <button onClick={this.onDateButtonClick(-7)}>&laquo; 1 viikko</button>
          <button onClick={this.onDateButtonClick(-1)}>&lsaquo; 1 päivä</button>
          <DateInput date={queryDate} onDateSelected={onDateSelected} />
          <button onClick={this.onDateButtonClick(1)}>1 päivä &rsaquo;</button>
          <button onClick={this.onDateButtonClick(7)}>1 viikko &raquo;</button>
        </div>
      </div>
    );
  }
}

export default DateSettings;
