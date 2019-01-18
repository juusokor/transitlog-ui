import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";
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
      distinct_on: journey_start_time
      order_by: [{journey_start_time: asc}, {received_at: desc}]
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
    }
  }
`;

const updateListenerName = "stop hfp query";

@observer
class StopHfpQuery extends Component {
  prevResult = {};

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
    } = this.props;

    const routesList = !routes || routes.length === 0 ? [] : routes;

    const queryRoutes = [];
    const queryDirections = [];

    routesList.forEach(({routeId, direction}) => {
      if (queryRoutes.indexOf(routeId) === -1) {
        queryRoutes.push(routeId);
      }

      const dirInt = parseInt(direction, 10);
      if (queryDirections.indexOf(dirInt) === -1) {
        queryDirections.push(dirInt);
      }
    });

    return (
      <Query
        fetchPolicy="no-cache"
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

          const journeysByRoute = groupBy(
            vehicles,
            (hfp) =>
              `${hfp.oday}:${hfp.journey_start_time}:${hfp.route_id}:${
                hfp.direction_id
              }`
          );

          const journeysByRouteAndTime = reduce(
            journeysByRoute,
            (groups, hfpItems, groupKey) => {
              groups[groupKey] = hfpItems[hfpItems.length - 1];
              return groups;
            },
            {}
          );

          this.prevResult = journeysByRouteAndTime;
          return children({journeys: journeysByRouteAndTime, loading});
        }}
      </Query>
    );
  }
}

export default StopHfpQuery;
