import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react";
import orderBy from "lodash/orderBy";

const routesQuery = gql`
  query routeOptionsQuery($line: String!, $date: Date!) {
    routes(date: $date, line: $line) {
      id
      lineId
      routeId
      direction
      name
      destination
      destinationStopId
      originStopId
      origin
      _matchScore
    }
  }
`;

export default observer(({line, date, children}) => {
  return (
    <Query query={routesQuery} variables={{line, date}}>
      {({loading, error, data}) => {
        const routes = get(data, "routes", []);
        const filteredRoutes = orderBy(routes, ["routeId", "direction"]);

        return children({
          loading,
          error,
          routes: filteredRoutes.length !== 0 ? filteredRoutes : routes,
        });
      }}
    </Query>
  );
});
