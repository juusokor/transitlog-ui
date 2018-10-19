import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import RouteFieldsFragment from "./RouteFieldsFragment";
import {observer} from "mobx-react";
import orderBy from "lodash/orderBy";
import parse from "date-fns/parse";
import isWithinRange from "date-fns/is_within_range";

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
      const queryDate = parse(`${date}T00:00:00`);
      const routes = get(data, "line.routes.nodes", []);

      const filteredRoutes = orderBy(
        routes.filter(({dateBegin, dateEnd}) => {
          const begin = parse(`${dateBegin}T00:00:00`);
          const end = parse(`${dateEnd}T23:59:00`);

          return isWithinRange(queryDate, begin, end);
        }),
        "routeId"
      );

      return children({
        loading,
        error,
        routes: filteredRoutes.length !== 0 ? filteredRoutes : routes,
      });
    }}
  </Query>
));
