import React, {Component} from "react";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import getDay from "date-fns/get_day";
import styled from "styled-components";
import {hfpClient} from "../../api";
import doubleDigit from "../../helpers/doubleDigit";
import parse from "date-fns/parse";
import isWithinRange from "date-fns/is_within_range";
import {Heading} from "../Typography";
import BusIcon from "../../icons/Bus";
import TramIcon from "../../icons/Tram";
import RailIcon from "../../icons/Rail";

const departuresQuery = gql`
  query routeDepartures($dayType: String, $stopId: String) {
    allDepartures(
      orderBy: [HOURS_ASC, MINUTES_ASC, DEPARTURE_ID_ASC]
      condition: {stopId: $stopId, dayType: $dayType}
    ) {
      nodes {
        stopId
        dayType
        hours
        minutes
        dateBegin
        dateEnd
        routeId
        direction
        departureId
      }
    }
  }
`;

const departureStartTimeQuery = gql`
  query departureStartTime(
    $routeId: String
    $direction: String
    $dateBegin: Date
    $dateEnd: Date
    $departureId: Int
    $dayType: String
  ) {
    allDepartures(
      first: 1
      orderBy: [HOURS_ASC, MINUTES_ASC]
      condition: {
        routeId: $routeId
        direction: $direction
        dateBegin: $dateBegin
        dateEnd: $dateEnd
        departureId: $departureId
        dayType: $dayType
      }
    ) {
      nodes {
        hours
        minutes
      }
    }
  }
`;

const stopDelayQuery = gql`
  query stopDelay(
    $routeId: String!
    $date: date!
    $direction: smallint!
    $stopId: String!
    $startTime: time!
  ) {
    vehicles(
      limit: 1
      order_by: received_at_desc
      where: {
        _and: {
          route_id: {_eq: $routeId}
          dir: {_eq: $direction}
          oday: {_eq: $date}
          journey_start_time: {_eq: $startTime}
          next_stop_id: {_eq: $stopId}
        }
      }
    ) {
      dl
    }
  }
`;

const dayTypes = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

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

const TimetableTime = styled.div`
  padding: 0 0.4em 0 0;
  margin: 0.25rem;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  border: 1px solid var(--lighter-grey);
  background: #fefefe;
`;

const transportIcon = {
  BUS: BusIcon,
  TRUNK: BusIcon,
  TRAM: TramIcon,
  RAIL: RailIcon,
};

const transportColor = {
  BUS: "var(--bus-blue)",
  TRUNK: "var(--orange)",
  TRAM: "var(--green)",
  RAIL: "var(--purple)",
};

const RouteTag = styled.span`
  padding: 2px 8px 2px 4px;
  border-radius: 3px;
  color: white;
  background-color: ${({mode}) => get(transportColor, mode, "var(--light-grey)")};
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  margin-right: 0.25rem;

  svg {
    width: 1rem;
    height: 1rem;
    margin-right: 2px;
  }
`;

const TimetableMinutes = styled.span``;

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

const StopDelay = ({
  routeId,
  direction,
  dateBegin,
  dateEnd,
  departureId,
  dayType,
  date,
  stopId,
}) => (
  <Query
    query={departureStartTimeQuery}
    variables={{
      routeId,
      direction,
      dateBegin,
      dateEnd,
      departureId,
      dayType,
    }}>
    {({loading, data, error}) => {
      if (loading) return "?";
      if (error) return "Error!";

      const {hours, minutes} = get(data, "allDepartures.nodes", [])[0];
      const startTime = `${doubleDigit(hours)}:${doubleDigit(minutes)}:00`;

      return (
        <Query
          client={hfpClient}
          variables={{routeId, date, direction, stopId, startTime}}
          query={stopDelayQuery}>
          {({loading, data, error}) => {
            if (loading) return "?";
            if (error) return "Error!";

            const vehicles = get(data, "vehicles", []);
            if (vehicles.length === 0) return "";

            const {dl} = vehicles[0];

            if (dl === 0) return "+-0:00";

            const sign = dl < 0 ? "+" : "-";
            const seconds = Math.abs(dl) % 60;
            const minutes = Math.floor(Math.abs(dl) / 60);

            return `${sign}${doubleDigit(minutes)}:${doubleDigit(seconds)}`;
          }}
        </Query>
      );
    }}
  </Query>
);

@inject(app("Filters"))
@observer
class StopTimetable extends Component {
  render() {
    const {
      state: {date},
      stop,
    } = this.props;

    const {
      stopId,
      modes: {nodes: modes},
    } = stop;

    const queryDayType = dayTypes[getDay(date)];
    const stopMode = modes[0];

    return (
      <Query
        query={departuresQuery}
        variables={{
          dayType: queryDayType,
          stopId,
        }}>
        {({loading, data, error}) => {
          if (loading) return "Loading...";
          if (error) return "Error!";
          const timetable = get(data, "allDepartures.nodes", []);

          const filteredTimetable = timetable.filter(({dateBegin, dateEnd}) => {
            const begin = parse(dateBegin);
            const end = parse(dateEnd);

            return isWithinRange(date, begin, end);
          });

          const byHour = groupBy(filteredTimetable, "hours");

          return (
            <TimetableGrid>
              {Object.entries(byHour).map(([hour, times], idx) => (
                <TimetableSection key={`hour_${hour}_${idx}`}>
                  <TimetableHour> {hour}</TimetableHour>{" "}
                  <TimetableTimes>
                    {times.map((time, idx) => (
                      <TimetableTime key={`time_${idx}`}>
                        <RouteTag mode={stopMode}>
                          {React.createElement(get(transportIcon, stopMode, null), {
                            fill: "white",
                            width: "16",
                            heigth: "16",
                          })}
                          {parseLineNumber(time.routeId)}
                        </RouteTag>
                        <TimetableMinutes>
                          {doubleDigit(time.minutes)}
                        </TimetableMinutes>
                        <StopDelay {...time} date={date} />
                      </TimetableTime>
                    ))}
                  </TimetableTimes>
                </TimetableSection>
              ))}
            </TimetableGrid>
          );
        }}
      </Query>
    );
  }
}

export default StopTimetable;
