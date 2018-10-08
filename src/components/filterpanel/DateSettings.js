import React, {Component} from "react";
import moment from "moment";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import DatePicker from "react-datepicker";
import "./DateInput.css";
import "react-datepicker/dist/react-datepicker.css";
import {Text} from "../../helpers/text";

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
          <label>
            <Text>filterpanel.choose_date</Text>
          </label>
        </p>
        <div className="date-input">
          <button onClick={this.onDateButtonClick(-7)}>
            &laquo; 1 <Text>general.week</Text>
          </button>
          <button onClick={this.onDateButtonClick(-1)}>
            &lsaquo; 1 <Text>general.day</Text>
          </button>
          <DatePicker
            locale="fi-FI"
            dateFormat="YYYY-MM-DD"
            selected={moment(date)}
            onChange={Filters.setDate}
            className="calendar"
          />
          <button onClick={this.onDateButtonClick(1)}>
            1 <Text>general.day</Text> &rsaquo;
          </button>
          <button onClick={this.onDateButtonClick(7)}>
            1 <Text>general.week</Text> &raquo;
          </button>
        </div>
      </div>
    );
  }
}

export default DateSettings;
