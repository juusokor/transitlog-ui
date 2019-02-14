import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import compact from "lodash/compact";
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
        {tst: desc}
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
      oday
      direction_id
      route_id
      unique_vehicle_id
      tst
      tsi
      lat
      long
      __typename
    }
  }
`;

const updateListenerName = "stop_hfp_query_";

@observer
class DepartureHfpQuery extends Component {
  componentWillUnmount() {
    removeUpdateListener(updateListenerName);
  }

  getUpdateListenerName = () => {
    const {routeId, direction, date, journeyStartTime} = this.props;
    return (
      updateListenerName +
      compact([routeId, direction, date, journeyStartTime]).join("_")
    );
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
          setUpdateListener(this.getUpdateListenerName(), refetch, false);
          const vehicles = get(data, "vehicles", []);

          console.log(loading);

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
