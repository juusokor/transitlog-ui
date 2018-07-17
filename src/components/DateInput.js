import React, {Component} from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "./DateInput.css";

import "react-datepicker/dist/react-datepicker.css";

export class DateInput extends Component {
  render() {
    const {date, dateBegin = date, dateEnd, onDateSelected} = this.props;

    return (
      <React.Fragment>
        <DatePicker
          selectsStart={!!dateEnd}
          startDate={dateEnd ? moment(dateBegin) : undefined}
          endDate={dateEnd ? moment(dateEnd) : undefined}
          selected={moment(dateBegin)}
          onChange={(date) => onDateSelected(date, dateEnd)}
          className="calendar"
        />
        {dateEnd && (
          <DatePicker
            selected={moment(dateEnd)}
            selectsEnd
            startDate={moment(dateBegin)}
            endDate={moment(dateEnd)}
            onChange={(date) => onDateSelected(dateBegin, date)}
            className="calendar"
          />
        )}
      </React.Fragment>
    );
  }
}
