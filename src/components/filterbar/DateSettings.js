import React, {Component} from "react";
import moment from "moment-timezone";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import DatePicker from "react-datepicker";
import {Text, text} from "../../helpers/text";
import {InputBase, ControlGroup} from "../Forms";

import "react-datepicker/dist/react-datepicker.css";
import PlusMinusInput from "../PlusMinusInput";
import Input from "../Input";
import styled from "styled-components";

const DateControlGroup = styled(ControlGroup)`
  margin-bottom: 1rem;
`;

const DateInput = styled(PlusMinusInput)`
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;

  > button {
    height: 2.5rem;
    padding: 0 0.25rem;
  }

  > div,
  .react-datepicker-wrapper,
  .react-datepicker__input-container {
    display: flex;
    flex: 1 1 auto;
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
  height: 2.5rem;
  text-align: center;
`;

@inject(app("Filters"))
@observer
class DateSettings extends Component {
  onDateButtonClick = (modifier) => () => {
    const {Filters, state} = this.props;

    if (!state.date) {
      Filters.setDate("");
    } else {
      const nextDate = moment
        .tz(state.date, "YYYY-MM-DD", "Europe/Helsinki")
        .add(modifier, "days");

      Filters.setDate(nextDate);
    }
  };

  render() {
    const {Filters, state} = this.props;
    const {date} = state;

    return (
      <DateControlGroup>
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
                locale="fi-FI"
                dateFormat="YYYY-MM-DD"
                selected={moment.tz(date, "Europe/Helsinki")}
                onChange={Filters.setDate}
                className="calendar"
              />
            </DateInput>
          </WeekInput>
        </Input>
      </DateControlGroup>
    );
  }
}

export default DateSettings;
