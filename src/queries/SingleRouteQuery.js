import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import pick from "lodash/pick";
import compact from "lodash/compact";
import {
  RouteFieldsFragment,
  ExtensiveRouteFieldsFragment,
} from "./RouteFieldsFragment";
import {observer} from "mobx-react";
import orderBy from "lodash/orderBy";
import first from "lodash/first";
import {getDayTypeFromDate} from "../helpers/getDayTypeFromDate";
import {isWithinRange} from "../helpers/isWithinRange";

export const singleRouteQuery = gql`
  query singleRouteQuery($routeId: String!, $direction: String!) {
    allRoutes(condition: {routeId: $routeId, direction: $direction}) {
      nodes {
        ...RouteFieldsFragment
      }
    }
  }
  ${RouteFieldsFragment}
`;

const extensiveSingleRouteQuery = gql`
  query extensiveSingleRouteQuery(
    $routeId: String!
    $direction: String!
    $dateBegin: Date!
    $dateEnd: Date!
    $dayType: String
  ) {
    route: routeByRouteIdAndDirectionAndDateBeginAndDateEnd(
      routeId: $routeId
      direction: $direction
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      ...RouteFieldsFragment
      ...ExtensiveRouteFieldsFragment
    }
  }
  ${RouteFieldsFragment}
  ${ExtensiveRouteFieldsFragment}
`;

export const fetchSingleRoute = (route, date, client) => {
  const {direction} = route;

  return client
    .query({
      query: singleRouteQuery,
      // Force direction into a string in case it isn't
      variables: {...route, direction: direction + ""},
    })
    .then(({data}) => get(data, "allRoutes.nodes", []))
    .then((routes) => {
      return first(
        orderBy(
          routes.filter(({dateBegin, dateEnd}) =>
            isWithinRange(date, dateBegin, dateEnd)
          ),
          "dateBegin",
          "desc"
        )
      );
    });
};

export default observer(({children, route, date, skip}) => {
  const variables = {
    ...pick(route, "routeId", "dateBegin", "dateEnd"),
    dayType: getDayTypeFromDate(date),
    direction: route.direction + "",
  };

  // If some variable are missing the query may block the UI, so make sure everything's here.
  const hasAllVariables = compact(Object.values(variables)).length === 5;

  return (
    <Query
      skip={skip || !hasAllVariables}
      query={extensiveSingleRouteQuery}
      variables={variables}>
      {({loading, error, data}) => {
        if (loading || error || !data) {
          return children({
            loading,
            error,
            route: null,
          });
        }

        const fetchedRoute = get(data, "route", null);

        return children({
          loading,
          error,
          route: fetchedRoute,
        });
      }}
    </Query>
  );
});
