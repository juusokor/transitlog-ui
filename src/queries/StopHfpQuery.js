import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import groupBy from "lodash/groupBy";
import reduce from "lodash/reduce";

const stopDelayQuery = gql`
  query stopDelay(
    $routes: [String]!
    $date: date!
    $directions: [smallint]!
    $stopId: String!
  ) {
    vehicles(
      where: {
        route_id: {_in: $routes}
        dir: {_in: $directions}
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

@observer
class StopHfpQuery extends Component {
  render() {
    const {
      onCompleted = () => {},
      routes,
      date,
      directions,
      stopId,
      skip,
      children,
    } = this.props;

    return (
      <Query
        skip={skip}
        onCompleted={onCompleted}
        client={hfpClient}
        variables={{routes, date, directions, stopId}}
        query={stopDelayQuery}>
        {({loading, data, error}) => {
          if (loading || error) {
            return children({journeys: {}, loading, error});
          }

          const journeysByRoute = groupBy(
            get(data, "vehicles", []),
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
