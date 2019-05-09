import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

const alertsQuery = gql`
  query routeOptionsQuery(
    $time: DateTime!
    $network: Boolean
    $allRoutes: Boolean
    $allStops: Boolean
    $route: String
    $stop: String
  ) {
    alerts(
      time: $time
      alertSearch: {
        network: $network
        allRoutes: $allRoutes
        allStops: $allStops
        route: $route
        stop: $stop
      }
    ) {
      ...AlertFieldsFragment
    }
  }
  ${AlertFieldsFragment}
`;

const AlertsQuery = observer(({time, children}) => {
  // TODO: Enable all alert queries through props if needed.

  return (
    <Query query={alertsQuery} variables={{time, network: true}}>
      {({loading, error, data}) => {
        const alerts = get(data, "alerts", []);

        return children({
          loading,
          error,
          alerts,
        });
      }}
    </Query>
  );
});

export default AlertsQuery;
