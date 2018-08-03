import React, {Component} from "react";
import {DateInput} from "./DateInput";
import moment from "moment";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";

@inject(app("Filters"))
@observer
class DateSettings extends Component {
  onDateButtonClick = (modifier) => () => {
    const {Filters, state} = this.props;
    const nextDate = moment(state.date, "YYYY-MM-DD").add(modifier, "days");
    Filters.setDate(nextDate);
  };

  render() {
    const {Filters, state} = this.props;
    const {date} = state;

    return (
      <div>
        <p>
          <label>Choose date</label>
        </p>
        <div className="date-input">
          <button onClick={this.onDateButtonClick(-7)}>&laquo; 1 viikko</button>
          <button onClick={this.onDateButtonClick(-1)}>&lsaquo; 1 päivä</button>
          <DateInput date={date} onDateSelected={Filters.setDate} />
          <button onClick={this.onDateButtonClick(1)}>1 päivä &rsaquo;</button>
          <button onClick={this.onDateButtonClick(7)}>1 viikko &raquo;</button>
        </div>
      </div>
    );
  }
}

export default DateSettings;
