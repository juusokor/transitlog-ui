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

const departuresQuery = gql`
  query routeDepartures($dayType: String, $stopId: String) {
    allDepartures(
      orderBy: DEPARTURE_ID_ASC
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
      }
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
          console.log(error, data);
          const timetable = get(data, "allDepartures.nodes", []);
          const filteredTimetable = timetable.filter(
            ({dateBegin, dateEnd}) =>
              this.props.date >= dateBegin && this.props.date <= dateEnd
          );
          const byHour = groupBy(filteredTimetable, "hours");
          console.log(byHour);
          return (
            <TimetableGrid>
              {Object.entries(byHour).map(([hour, times]) => (
                <React.Fragment>
                  <TimetableHour> {hour}: </TimetableHour>{" "}
                  <TimetableTimes>
                    {times.map((time) => (
                      <TimetableTime>
                        {" "}
                        {time.minutes}/{time.routeId}{" "}
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
