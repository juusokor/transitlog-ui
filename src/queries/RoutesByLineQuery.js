import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";

const routesByLineQuery = gql`
  query lineQuery($lineId: String!, $dateBegin: Date!, $dateEnd: Date!) {
    line: lineByLineIdAndDateBeginAndDateEnd(
      lineId: $lineId
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      routes {
        nodes {
          nodeId
          routeId
          direction
          dateBegin
          dateEnd
          destinationFi
          originFi
          nameFi
          originstopId
        }
      }
    }
  }
`;

export default ({variables, children}) => (
  <Query query={routesByLineQuery} variables={variables}>
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
);
