import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import {removeUpdateListener, setUpdateListener} from "../stores/UpdateManager";

const stopDelayQuery = gql`
  query stopDelay(
    $date: date!
    $stopId: String!
    $routeId: String!
    $directionId: smallint!
    $journeyStartTime: time
  ) {
    vehicles(
      distinct_on: [oday, route_id, direction_id, journey_start_time]
      order_by: [
        {oday: asc}
        {route_id: asc}
        {direction_id: asc}
        {journey_start_time: asc}
        {received_at: desc}
      ]
      where: {
        journey_start_time: {_eq: $journeyStartTime}
        route_id: {_eq: $routeId}
        direction_id: {_eq: $directionId}
        oday: {_eq: $date}
        next_stop_id: {_eq: $stopId}
      }
    ) {
      journey_start_time
      next_stop_id
      received_at
      oday
      direction_id
      route_id
      unique_vehicle_id
      received_at
      lat
      long
    }
  }
`;

const updateListenerName = "stop hfp query";

@observer
class DepartureHfpQuery extends Component {
  componentWillUnmount() {
    removeUpdateListener(updateListenerName);
  }

  onUpdate = (refetch) => () => {
    const {date, stopId, skip} = this.props;

    if (!skip) {
      refetch({date, stopId});
    }
  };

  render() {
    const {
      routeId,
      direction,
      date,
      stopId,
      journeyStartTime,
      skip,
      children,
    } = this.props;

    return (
      <Query
        skip={skip}
        variables={{
          date,
          stopId,
          routeId,
          journeyStartTime,
          directionId: direction,
        }}
        query={stopDelayQuery}>
        {({loading, data, error, refetch, variables}) => {
          setUpdateListener(updateListenerName, this.onUpdate(refetch), false);
          const vehicles = get(data, "vehicles", []);

          if (vehicles.length === 0 || loading || error) {
            return children({event: null, loading, error, variables});
          }

          return children({event: vehicles[0], loading, error, variables});
        }}
      </Query>
    );
  }
}

export default DepartureHfpQuery;
