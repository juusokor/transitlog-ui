import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import {hfpClient} from "../api";
import gql from "graphql-tag";
import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";
import flatten from "lodash/flatten";

const createQueryPart = (direction, routes) => {
  const queryName = `direction_${direction}`;

  return `
    ${queryName}: vehicles(
      where: {
        route_id: {_in: ["${routes.join('","')}"]}
        direction_id: {_eq: ${direction}}
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
  `;
};

const stopDelayQuery = (queryParts) => gql`
  query stopDelay(
    $date: date!
    $stopId: String!
  ) {
    ${queryParts}
  }
`;

@observer
class StopHfpQuery extends Component {
  render() {
    const {
      onCompleted = () => {},
      routes = {},
      date,
      stopId,
      skip,
      children,
    } = this.props;

    /*
     * The routes prop should be a map of routes grouped by direction, like this:
     * {
     *   1: [routeId, routeId, routeId...],
     *   2: [routeId, routeId, routeId...],
     * }
     */

    const routesList =
      !routes || Object.keys(routes).length === 0 ? {"1": []} : routes;

    const queryParts = Object.entries(routesList)
      .map(([direction, routes]) => createQueryPart(direction, routes))
      .join("");

    const query = stopDelayQuery(queryParts);

    return (
      <Query
        skip={skip}
        onCompleted={onCompleted}
        client={hfpClient}
        variables={{date, stopId}}
        query={query}>
        {({loading, data, error}) => {
          if (loading || error) {
            return children({journeys: {}, loading, error});
          }

          const vehicles = flatten(Object.values(data));

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

          return children({journeys: journeysByRouteAndTime, loading});
        }}
      </Query>
    );
  }
}

export default StopHfpQuery;
