import React, {Component} from "react";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import {Heading} from "../Typography";
import DeparturesQuery from "../../queries/DeparturesQuery";
import TimetableDeparture from "./TimetableDeparture";

const TimetableGrid = styled.div`
  margin-bottom: 1rem;
`;

const TimetableHour = styled(Heading).attrs({level: 4})`
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--lighter-grey);
  padding: 0.75rem 1rem;
`;

const TimetableSection = styled.div``;

const TimetableTimes = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 0.75rem;
`;

@inject(app("Filters", "Journey", "Time"))
@observer
class StopTimetable extends Component {
  selectAsJourney = (departure) => (e) => {
    e.preventDefault();

    const currentTime = `${doubleDigit(departure.hours)}:${doubleDigit(
      departure.minutes
    )}:00`;

    const route = {
      direction: departure.direction,
      routeId: departure.routeId,
    };

    this.props.Time.setTime(currentTime);
    this.props.Filters.setRoute(route);

    if (departure.journey) {
      this.props.Journey.setSelectedJourney(departure.journey, false);
    }
  };

  render() {
    const {
      state: {date},
      stop,
    } = this.props;

    return (
      <DeparturesQuery stop={stop} date={date}>
        {({departures = []}) => {
          const byHour = groupBy(departures, ({hours, minutes}) => {
            if (hours === 4 && minutes >= 30) {
              return `${doubleDigit(hours)}:30`;
            }

            return `${doubleDigit(hours)}:00`;
          });

          // make sure that night departures from the same operation day comes
          // last in the timetable list.
          const byHourOrdered = orderBy(Object.entries(byHour), ([hour]) => {
            const hourVal = parseInt(hour.replace(":", ""));

            if (hourVal < 430) {
              return hourVal + 1000;
            }

            return hourVal;
          });

          return (
            <TimetableGrid>
              {byHourOrdered.map(([hour, times], idx) => (
                <TimetableSection key={`hour_${hour}_${idx}`}>
                  <TimetableHour> {hour}</TimetableHour>
                  <TimetableTimes>
                    {times.map((departure, idx) => (
                      <TimetableDeparture
                        key={`time_${idx}`}
                        onClick={this.selectAsJourney}
                        stop={stop}
                        date={date}
                        departure={departure}
                      />
                    ))}
                  </TimetableTimes>
                </TimetableSection>
              ))}
            </TimetableGrid>
          );
        }}
      </DeparturesQuery>
    );
  }
}

export default StopTimetable;
