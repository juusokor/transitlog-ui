import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import RouteFieldsFragment from "./RouteFieldsFragment";
import {observer} from "mobx-react";
import orderBy from "lodash/orderBy";
import {filterRoutes} from "../helpers/filterJoreCollections";

const routesByLineQuery = gql`
  query routesByLineQuery($lineId: String!, $dateBegin: Date!, $dateEnd: Date!) {
    line: lineByLineIdAndDateBeginAndDateEnd(
      lineId: $lineId
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      __typename
      lineId
      dateBegin
      dateEnd
      routes {
        nodes {
          ...RouteFieldsFragment
        }
      }
    }
  }
  ${RouteFieldsFragment}
`;

export default observer(({line, date, children}) => (
  <Query query={routesByLineQuery} variables={line}>
    {({loading, error, data}) => {
      const routes = get(data, "line.routes.nodes", []);
      const filteredRoutes = orderBy(filterRoutes(routes, date), "routeId");

      return children({
        loading,
        error,
        routes: filteredRoutes.length !== 0 ? filteredRoutes : routes,
      });
    }}
  </Query>
));
