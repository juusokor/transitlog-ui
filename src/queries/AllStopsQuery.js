import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";

const allStopsQuery = gql`
  query allStopsQuery {
    allStops {
      nodes {
        nodeId
        stopId
        shortId
        lat
        lon
        nameFi
        __typename
      }
    }
  }
`;

export default ({children}) => (
  <Query query={allStopsQuery}>
    {({loading, error, data}) => {
      if (loading) return "Loading...";
      if (error) return "Error!";

      const stops = get(data, "allStops.nodes", []);

      return children({
        loading,
        error,
        stops,
      });
    }}
  </Query>
);
