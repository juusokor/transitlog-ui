import React, {Component} from "react";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import {observer} from "mobx-react";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import {Heading} from "../Typography";
import TimetableDeparture from "./TimetableDeparture";
import {action} from "mobx";

function removeInitialZero(str) {
  if (str.startsWith("0")) {
    return str.slice(1);
  }

  return str;
}

const TimetableGrid = styled.div`
  margin-bottom: 1rem;
`;

const TimetableHour = styled(Heading).attrs({level: 4})`
  margin-bottom: 1rem;
  margin-top: 1rem;
  border-bottom: 1px solid var(--lighter-grey);
  padding: 0 0.75rem 1rem;
`;

const TimetableSection = styled.div`
  margin-bottom: 2rem;
`;

const TimetableTimes = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0.5rem 0 0.75rem;
`;

@observer
class StopTimetable extends Component {
  render() {
    const {
      routeFilter,
      timeRangeFilter,
      departures,
      date,
      selectedJourney,
      stop,
      onSelectAsJourney,
      setSelectedJourneyOffset,
    } = this.props;

    const byHour = groupBy(departures, ({hours, minutes}) => {
      if (hours === 4 && minutes >= 30) {
        return `${doubleDigit(hours)}:30`;
      }

      return `${doubleDigit(hours)}:00`;
    });

    // make sure that night departures from the same operation day comes
    // last in the timetable list.
    const byHourOrdered = orderBy(Object.entries(byHour), ([hour]) => {
      // Take care of edge cases where the initial zero might cause problems
      const hourVal = parseInt(removeInitialZero(hour).replace(":", ""));

      // And the edge case of 00:00 (parsed to integer 0)
      if (hourVal === 0) {
        return 2400;
      }

      if (hourVal < 430) {
        return hourVal + 10000;
      }

      return hourVal;
    });

    const {min, max} = timeRangeFilter;

    return (
      <TimetableGrid>
        {byHourOrdered.map(([hour, times], idx) => {
          let showTimes = times;

          if (min !== "" || max !== "") {
            const intHour = parseInt(hour.replace(":", ""), 10) / 100;
            if (intHour < parseInt(min) || intHour > parseInt(max)) {
              return null;
            }
          }

          if (routeFilter) {
            showTimes = times.filter((departure) =>
              get(departure, "routeId", "")
                .substring(1)
                .replace(/^0+/, "")
                .startsWith(routeFilter)
            );
          }

          return (
            <TimetableSection key={`hour_${hour}_${idx}`}>
              <TimetableHour> {hour}</TimetableHour>
              <TimetableTimes>
                {showTimes.map((departure, idx) => (
                  <TimetableDeparture
                    setSelectedJourneyOffset={setSelectedJourneyOffset}
                    routeFilter={routeFilter}
                    timeRangeFilter={timeRangeFilter}
                    selectedJourney={selectedJourney}
                    key={`time_${idx}`}
                    onClick={onSelectAsJourney}
                    stop={stop}
                    date={date}
                    departure={departure}
                  />
                ))}
              </TimetableTimes>
            </TimetableSection>
          );
        })}
      </TimetableGrid>
    );
  }
}

export default StopTimetable;
