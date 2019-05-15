import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react";
import orderBy from "lodash/orderBy";
import {RouteFieldsFragment} from "./RouteFieldsFragment";

const routesQuery = gql`
  query routeOptionsQuery($date: Date!) {
    routes(date: $date) {
      ...RouteFieldsFragment
      _matchScore
    }
  }
  ${RouteFieldsFragment}
`;

const RouteOptionsQuery = observer(({date, children}) => {
  return (
    <Query query={routesQuery} variables={{date}}>
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

export default RouteOptionsQuery;
