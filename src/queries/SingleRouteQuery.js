import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {
  RouteFieldsFragment,
  ExtensiveRouteFieldsFragment,
} from "./RouteFieldsFragment";
import {observer} from "mobx-react";
import parse from "date-fns/parse";
import orderBy from "lodash/orderBy";
import first from "lodash/first";
import isWithinRange from "date-fns/is_within_range";
import {getDayTypeFromDate} from "../helpers/getDayTypeFromDate";

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
      variables: {...route, direction: direction + ""},
    })
    .then(({data}) => get(data, "allRoutes.nodes", []))
    .then((routes) => {
      const queryDate = parse(`${date}T00:00:00`);

      return first(
        orderBy(
          routes.filter(({dateBegin, dateEnd}) => {
            const begin = parse(`${dateBegin}T00:00:00`);
            const end = parse(`${dateEnd}T23:59:00`);

            return isWithinRange(queryDate, begin, end);
          }),
          "dateBegin",
          "desc"
        )
      );
    });
};

export default observer(({children, route, date}) => (
  <Query
    query={extensiveSingleRouteQuery}
    variables={{...route, dayType: getDayTypeFromDate(date)}}>
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
));
