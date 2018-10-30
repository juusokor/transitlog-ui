import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
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
class StopHfpQuery extends Component {
  render() {
    const {
      onCompleted = () => {},
      routeId,
      date,
      direction,
      stopId,
      startTime,
      children,
    } = this.props;

    return (
      <Query
        onCompleted={onCompleted}
        fetchPolicy="cache-first"
        partialRefetch={true}
        client={hfpClient}
        variables={{routeId, date, direction, stopId, startTime}}
        query={stopDelayQuery}>
        {({loading, data}) => {
          const journey = get(data, "vehicles[0]", null);
          return children({journey});
        }}
      </Query>
    );
  }
}

export default StopHfpQuery;
