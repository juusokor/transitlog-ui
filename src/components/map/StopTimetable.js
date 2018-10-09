import React, {Component} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../hoc/withRoute";

const departuresByStopQuery = gql`
  query stopDepartures(
    $stopId: String!
    $routeId: String!
    $dateBegin: Date!
    $dateEnd: Date!
  ) {
    allDepartures(
      condition: {
        stopId: $stopId
        routeId: $routeId
        dateBegin: $dateBegin
        dateEnd: $dateEnd
        dayType: "Su"
      }
    ) {
      nodes {
        stopId
        routeId
        departureId
        hours
        minutes
        dateBegin
        dateEnd
        dayType
      }
    }
  }
`;

@inject(app("Filters"))
@observer
class StopTimetable extends Component {
  render() {
    return (
      <Query
        query={departuresByStopQuery}
        variables={{
          routeId: "1078",
          direction: "2",
          dateBegin: "2018-06-18",
          dateEnd: "2018-08-12",
          stopId: "1362148",
        }}>
        {({loading, data, error}) => {
          if (loading) return "Loading...";
          if (error) return "Error!";
          console.log(error, data);
          const timetable = get(data, "allDepartures.nodes", []);

          return (
            <React.Fragment>
              {timetable.map((departure) => (
                <button
                  key={`route_${departure.hours}_${departure.minutes}`}
                  className={"stop-route-list"}>
                  {departure.hours + ":" + departure.minutes}
                </button>
              ))}
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default StopTimetable;
