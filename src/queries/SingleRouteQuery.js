import React, {useMemo} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {RouteFieldsFragment} from "./RouteFieldsFragment";
import {observer} from "mobx-react-lite";
import {getServerClient} from "../api";

const singleRouteQuery = gql`
  query singleRouteQuery($routeId: String!, $direction: Direction!, $date: Date!) {
    route(routeId: $routeId, direction: $direction, date: $date) {
      ...RouteFieldsFragment
    }
  }
  ${RouteFieldsFragment}
`;

const client = getServerClient();

const SingleRouteQuery = observer(
  ({children, routeId, direction, date, skip, onCompleted}) => {
    const variables = useMemo(
      () => ({
        routeId,
        direction,
        date,
      }),
      [routeId, direction, date]
    );

    return (
      <Query
        client={client}
        onCompleted={onCompleted}
        skip={skip || !routeId || !date}
        query={singleRouteQuery}
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

export default SingleRouteQuery;
