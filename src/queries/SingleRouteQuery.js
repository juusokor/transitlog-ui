import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import pick from "lodash/pick";
import compact from "lodash/compact";
import {RouteFieldsFragment, ExtensiveRouteFieldsFragment} from "./RouteFieldsFragment";
import {observer} from "mobx-react";
import {getDayTypeFromDate} from "../helpers/getDayTypeFromDate";

const extensiveSingleRouteQuery = gql`
  query extensiveSingleRouteQuery(
    $routeId: String!
    $direction: String!
    $dateBegin: Date!
    $dateEnd: Date!
    $departureHours: Int
    $departureMinutes: Int
    $isNextDay: Boolean
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

const ExtensiveRouteQuery = observer(
  ({
    children,
    route,
    date,
    departureHours,
    departureMinutes,
    skip,
    onCompleted = () => {},
  }) => {
    const variables = {
      ...pick(route, "routeId", "dateBegin", "dateEnd"),
      dayType: getDayTypeFromDate(date),
      direction: route.direction + "",
      departureHours,
      departureMinutes,
    };

    // If some variable are missing the query may block the UI, so make sure everything's here.
    const hasAllVariables = compact(Object.values(variables)).length >= 5;

    return (
      <Query
        onCompleted={onCompleted}
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
  }
);

export default ExtensiveRouteQuery;
