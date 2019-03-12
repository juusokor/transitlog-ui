import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import compact from "lodash/compact";
import {removeUpdateListener, setUpdateListener} from "../stores/UpdateManager";

const stopDelayQuery = gql`
  query stopDelay($date: date!, $stopId: String!) {
    vehicles(
      distinct_on: [journey_start_time, unique_vehicle_id]
      order_by: [{journey_start_time: asc}, {unique_vehicle_id: asc}, {tst: desc}]
      where: {next_stop_id: {_eq: $stopId}, oday: {_eq: $date}}
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
    const {date, stopId, skip = false, children} = this.props;

    // TODO: If things are off with how the component responds to updates, check
    //  the fetchPolicy here. It seems to fix the no-updates-at-all problem though.

    return (
      <Query
        skip={skip}
        variables={{
          date,
          stopId,
        }}
        query={stopDelayQuery}>
        {({loading, data, error, refetch, variables}) => {
          setUpdateListener(this.getUpdateListenerName(), refetch, false);
          const vehicles = get(data, "vehicles", []);

          if (vehicles.length === 0 || loading || error) {
            return children({events: [], loading, error, variables});
          }

          return children({events: vehicles, loading, error, variables});
        }}
      </Query>
    );
  }
}

export default DepartureHfpQuery;
