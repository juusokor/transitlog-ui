import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {StopFieldsWithRouteSegmentsFragment} from "./StopFieldsFragment";
import {observer} from "mobx-react";

export const singleStopQuery = gql`
  query singleStopQuery($stop: String!, $date: Date, $fetchRouteSegments: Boolean!) {
    allStops(condition: {stopId: $stop}, first: 1) {
      nodes {
        ...StopFieldsWithRouteSegmentsFragment
      }
    }
  }
  ${StopFieldsWithRouteSegmentsFragment}
`;

export default observer(({children, stop, date, fetchRouteSegments = false}) => (
  <Query query={singleStopQuery} variables={{stop, date, fetchRouteSegments}}>
    {({loading, error, data}) => {
      if (loading) {
        return children({
          loading,
          error: null,
          stop: null,
        });
      }
      if (error) {
        return children({
          loading: false,
          error,
          stop: null,
        });
      }

      const stop = get(data, "allStops.nodes[0]", null);

      return children({
        loading: false,
        error: null,
        stop,
      });
    }}
  </Query>
));
