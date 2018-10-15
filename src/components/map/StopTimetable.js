import React, {Component} from "react";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../hoc/withRoute";
import getDay from "date-fns/get_day";
import styled from "styled-components";
import {hfpClient} from "../../api";
import doubleDigit from "../../helpers/doubleDigit";

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

const TimetableGrid = styled.div`
  display: grid;
  grid-template-columns: 5em auto;
  grid-template-rows: repeat(auto-fill, auto);
`;

const TimetableHour = styled.div``;

const TimetableTimes = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const TimetableTime = styled.div`
  padding: 0.2em;
`;

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
            return `${sign}${minutes}:${("0" + seconds).slice(-2)}`;
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
    const queryDayType = dayTypes[getDay(this.props.date)];
    return (
      <Query
        query={departuresQuery}
        variables={{
          dayType: queryDayType,
          stopId: this.props.stopId,
        }}>
        {({loading, data, error}) => {
          if (loading) return "Loading...";
          if (error) return "Error!";
          const timetable = get(data, "allDepartures.nodes", []);
          const filteredTimetable = timetable.filter(
            ({dateBegin, dateEnd}) =>
              this.props.date >= dateBegin && this.props.date <= dateEnd
          );
          const byHour = groupBy(filteredTimetable, "hours");

          console.log(byHour);

          return (
            <TimetableGrid>
              {Object.entries(byHour).map(([hour, times], idx) => (
                <React.Fragment key={`hour_${hour}_${idx}`}>
                  <TimetableHour> {hour}: </TimetableHour>{" "}
                  <TimetableTimes>
                    {times.map((time, idx) => (
                      <TimetableTime key={`time_${idx}`}>
                        {" "}
                        {time.minutes}/{parseLineNumber(time.routeId)}
                        <StopDelay {...time} date={this.props.date} />{" "}
                      </TimetableTime>
                    ))}
                  </TimetableTimes>
                </React.Fragment>
              ))}
            </TimetableGrid>
          );
        }}
      </Query>
    );
  }
}

export default StopTimetable;
