import React, {Component} from "react";
import groupBy from "lodash/groupBy";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import {Heading} from "../Typography";
import DeparturesQuery from "../../queries/DeparturesQuery";
import TimetableDeparture from "./TimetableDeparture";

const TimetableGrid = styled.div``;

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
          const byHour = groupBy(departures, "hours");

          return (
            <TimetableGrid>
              {Object.entries(byHour).map(([hour, times], idx) => (
                <TimetableSection key={`hour_${hour}_${idx}`}>
                  <TimetableHour> {doubleDigit(hour)}</TimetableHour>
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
