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
    $routeIds: [String]!
    $directionIds: [smallint]!
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
        route_id: {_in: $routeIds}
        direction_id: {_in: $directionIds}
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
    }
  }
`;

const updateListenerName = "stop hfp query";

@observer
class StopHfpQuery extends Component {
  prevResult = [];

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
      onCompleted = () => {},
      routes = [],
      date,
      stopId,
      skip,
      children,
      routeFilter,
    } = this.props;

    const routesList = !routes || routes.length === 0 ? [] : routes;

    const queryRoutes = [];
    const queryDirections = [];

    routesList.forEach(({routeId, direction}) => {
      if (
        queryRoutes.indexOf(routeId) === -1 &&
        (!routeFilter ||
          (routeFilter && routeId.startsWith(routeFilter.toLowerCase())))
      ) {
        queryRoutes.push(routeId);
      }

      const dirInt = parseInt(direction, 10);
      if (queryDirections.indexOf(dirInt) === -1) {
        queryDirections.push(dirInt);
      }
    });

    return (
      <Query
        skip={skip || queryRoutes.length === 0}
        onCompleted={onCompleted}
        variables={{
          date,
          stopId,
          routeIds: queryRoutes,
          directionIds: queryDirections,
        }}
        query={stopDelayQuery}>
        {({loading, data, error, refetch}) => {
          setUpdateListener(updateListenerName, this.onUpdate(refetch), false);
          const vehicles = get(data, "vehicles", []);

          if (vehicles.length === 0 || loading || error) {
            return children({journeys: this.prevResult, loading, error});
          }

          this.prevResult = vehicles;
          return children({journeys: vehicles, loading});
        }}
      </Query>
    );
  }
}

export default StopHfpQuery;
