import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import RouteFieldsFragment from "./RouteFieldsFragment";
import {observer} from "mobx-react";

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

export default observer(({line, children}) => (
  <Query query={routesByLineQuery} variables={line}>
    {({loading, error, data}) => {
      if (loading) return <div>Loading...</div>;
      if (error) return <div>Error!</div>;

      return children({
        loading,
        error,
        routes: get(data, "line.routes.nodes", []),
      });
    }}
  </Query>
));
