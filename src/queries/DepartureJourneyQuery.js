import {observer} from "mobx-react";
import React, {Component} from "react";
import get from "lodash/get";
import doubleDigit from "../helpers/doubleDigit";
import {Query} from "react-apollo";
import {hfpClient} from "../api";
import gql from "graphql-tag";
import DeparturesQuery from "./DeparturesQuery";
import HfpFieldsFragment from "./HfpFieldsFragment";

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
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

@observer
class DepartureJourneyQuery extends React.Component {
  render() {
    const {date, departure, children} = this.props;
    const {departureId, dateBegin, dateEnd, routeId, direction, stopId} = departure;

    return (
      <DeparturesQuery
        departureId={departureId}
        limit={1}
        dateBegin={dateBegin}
        dateEnd={dateEnd}
        route={{routeId, direction}}
        date={date}>
        {({departures}) => {
          if (departures.length === 0) {
            return children({journey: null});
          }

          const {hours, minutes} = get(departures, "[0]", {});
          const startTime = `${doubleDigit(hours)}:${doubleDigit(minutes)}:00`;

          return (
            <Query
              client={hfpClient}
              variables={{routeId, date, direction, stopId, startTime}}
              query={stopDelayQuery}>
              {({loading, data}) => {
                const vehicles = get(data, "vehicles", []);

                if (vehicles.length === 0) {
                  return children({journey: null});
                }

                const journey = vehicles[0];
                return children({journey});
              }}
            </Query>
          );
        }}
      </DeparturesQuery>
    );
  }
}

export default DepartureJourneyQuery;
