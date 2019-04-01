import React, {useCallback} from "react";
import {createPortal} from "react-dom";
import moment from "moment-timezone";
import {observer} from "mobx-react-lite";
import DatePicker from "react-datepicker";
import {text} from "../../helpers/text";
import {InputBase, ControlGroup} from "../Forms";
import "react-datepicker/dist/react-datepicker.css";
import PlusMinusInput from "../PlusMinusInput";
import Input from "../Input";
import styled from "styled-components";
import {TIMEZONE} from "../../constants";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";
import ExceptionDaysQuery from "../../queries/ExceptionDaysQuery";

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

const CalendarInput = styled(InputBase)`
  min-width: 8rem;
  height: calc(2rem + 6px);
  text-align: center;
  border-color: var(--blue);
`;

// A simple portal to render the calendar outside the FilterSection.
const CalendarContainer = (root) => ({className, children}) =>
  root.current
    ? createPortal(<div className={className}>{children}</div>, root.current)
    : null;

const decorate = flow(
  observer,
  inject("Filters", "Time")
);

const DateSettings = decorate(({calendarRootRef, Filters, Time, state: {date, live}}) => {
  const setDate = useCallback(
    (dateVal) => {
      if (live) {
        Time.toggleLive(false);
      }

      Filters.setDate(dateVal);
    },
    [Time, Filters, live]
  );

  const onDateButtonClick = useCallback(
    (modifier) => {
      if (!date) {
        Filters.setDate("");
      } else {
        const nextDate = moment.tz(date, "YYYY-MM-DD", TIMEZONE);

        if (modifier < 0) {
          nextDate.subtract(Math.abs(modifier), "days");
        } else {
          nextDate.add(Math.abs(modifier), "days");
        }

        setDate(nextDate);
      }
    },
    [Filters, date, setDate]
  );

  return (
    <DateControlGroup>
      <Input label={text("filterpanel.choose_date_time")} animatedLabel={false}>
        <WeekInput
          minusHelp="One week backward"
          plusHelp="One week forward"
          minusLabel={<>&laquo; 7</>}
          plusLabel={<>7 &raquo;</>}
          onDecrease={onDateButtonClick.bind(undefined, -7)}
          onIncrease={onDateButtonClick.bind(undefined, 7)}>
          <DateInput
            minusHelp="One day backward"
            plusHelp="One day forward"
            minusLabel={<>&lsaquo; 1</>}
            plusLabel={<>1 &rsaquo;</>}
            onDecrease={onDateButtonClick.bind(undefined, -1)}
            onIncrease={onDateButtonClick.bind(undefined, 1)}>
            <ExceptionDaysQuery>
              {({exceptionDays = []}) => {
                const dates = exceptionDays.map(
                  ({exceptionDate}) => new Date(exceptionDate)
                );

                return (
                  <DatePicker
                    dropdownMode="select"
                    customInput={<CalendarInput helpText="Select date field" />}
                    dateFormat="yyyy-MM-dd"
                    selected={moment.tz(date, TIMEZONE).toDate()}
                    onChange={setDate}
                    className="calendar"
                    highlightDates={dates}
                    // Z-indexing is tricky in the filterbar, so the calendarcontainer mounts
                    // a portal in a better place for the datepicker.
                    calendarContainer={CalendarContainer(calendarRootRef)}
                  />
                );
              }}
            </ExceptionDaysQuery>
          </DateInput>
        </WeekInput>
      </Input>
    </DateControlGroup>
  );
});

export default DateSettings;
