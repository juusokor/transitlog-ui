import React, {Component} from "react";
import {createPortal} from "react-dom";
import moment from "moment-timezone";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import DatePicker from "react-datepicker";
import {text} from "../../helpers/text";
import {InputBase, ControlGroup} from "../Forms";

import "react-datepicker/dist/react-datepicker.css";
import PlusMinusInput from "../PlusMinusInput";
import Input from "../Input";
import styled from "styled-components";
import {TIMEZONE} from "../../constants";
import Help from "../../helpers/Help";

const DateControlGroup = styled(ControlGroup)`
  margin-bottom: 1.25rem;
  position: relative;
`;

const DateInput = styled(PlusMinusInput)`
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;

  > button {
    height: calc(2rem + 4px);
    padding: 0 0.25rem;
  }

  > div,
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    display: flex;
    flex: 1 1 auto;
  }

  .react-datepicker-popper {
    z-index: 100;
  }
`;

const WeekInput = styled(PlusMinusInput)`
  width: 100%;
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  margin-top: -0.25rem;

  > button {
    background: white;
    border-color: var(--blue);
    color: var(--blue);
    z-index: 0;
    padding: 0 0.25rem;

    &:hover {
      background: #eeeeee;
    }
  }
`;

const Calendar = styled(InputBase.withComponent(DatePicker))`
  min-width: 8rem;
  height: calc(2rem + 6px);
  text-align: center;
  border-color: var(--blue);
`;

// A simple portal to render the calendar outside the FilterSection.
const CalendarContainer = (root) => ({className, children}) =>
  root ? createPortal(<div className={className}>{children}</div>, root) : null;

@inject(app("Filters", "Time"))
@observer
class DateSettings extends Component {
  onDateButtonClick = (modifier) => () => {
    const {Filters, state} = this.props;

    if (!state.date) {
      Filters.setDate("");
    } else {
      const nextDate = moment.tz(state.date, "YYYY-MM-DD", TIMEZONE);

      if (modifier < 0) {
        nextDate.subtract(Math.abs(modifier), "days");
      } else {
        nextDate.add(Math.abs(modifier), "days");
      }

      this.setDate(nextDate);
    }
  };

  setDate = (dateVal) => {
    const {
      Filters,
      Time,
      state: {live},
    } = this.props;

    if (live) {
      Time.toggleLive(false);
    }

    Filters.setDate(dateVal);
  };

  render() {
    const {
      calendarRoot,
      state: {date},
    } = this.props;

    return (
      <DateControlGroup>
        <Help>
          <Input label={text("filterpanel.choose_date_time")} animatedLabel={false}>
            <WeekInput
              minusLabel={<>&laquo; 7</>}
              plusLabel={<>7 &raquo;</>}
              onDecrease={this.onDateButtonClick(-7)}
              onIncrease={this.onDateButtonClick(7)}>
              <DateInput
                minusLabel={<>&lsaquo; 1</>}
                plusLabel={<>1 &rsaquo;</>}
                onDecrease={this.onDateButtonClick(-1)}
                onIncrease={this.onDateButtonClick(1)}>
                <Calendar
                  dateFormat="yyyy-MM-dd"
                  selected={moment.tz(date, TIMEZONE).toDate()}
                  onChange={this.setDate}
                  className="calendar"
                  calendarContainer={CalendarContainer(calendarRoot)}
                />
              </DateInput>
            </WeekInput>
          </Input>
        </Help>
      </DateControlGroup>
    );
  }
}

export default DateSettings;
