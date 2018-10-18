import {observer} from "mobx-react";
import React, {Component} from "react";
import get from "lodash/get";
import doubleDigit from "../helpers/doubleDigit";
import {Query} from "react-apollo";
import {hfpClient} from "../api";
import gql from "graphql-tag";
import DeparturesQuery from "../queries/DeparturesQuery";
import {pickJourneyProps} from "../helpers/pickJourneyProps";
import HfpFieldsFragment from "../queries/HfpFieldsFragment";

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

export default (Component) => {
  @observer
  class WithDepartureJourneyComponent extends React.Component {
    render() {
      const {date, departure} = this.props;

      const {
        departureId,
        dateBegin,
        dateEnd,
        routeId,
        direction,
        stopId,
      } = departure;

      return (
        <DeparturesQuery
          departureId={departureId}
          dateBegin={dateBegin}
          dateEnd={dateEnd}
          route={{routeId, direction}}
          date={date}>
          {({departures}) => {
            if (departures.length === 0) {
              return <Component {...this.props} />;
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
                    return <Component {...this.props} />;
                  }

                  const journey = vehicles[0];
                  return <Component {...this.props} journey={journey} />;
                }}
              </Query>
            );
          }}
        </DeparturesQuery>
      );
    }
  }

  return WithDepartureJourneyComponent;
};
