import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {StopFieldsWithRouteSegmentsFragment} from "./StopFieldsFragment";
import {observer} from "mobx-react";

export const singleStopQuery = gql`
  query singleStopQuery($stop: ID!, $date: Date, $fetchRouteSegments: Boolean!) {
    stop(nodeId: $stop) {
      ...StopFieldsWithRouteSegmentsFragment
    }
  }
  ${StopFieldsWithRouteSegmentsFragment}
`;

export default observer(({children, stop, date}) => (
  <Query
    query={singleStopQuery}
    variables={{stop, date, fetchRouteSegments: !!date}}>
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

      const stop = get(data, "stop", null);

      return children({
        loading: false,
        error: null,
        stop,
      });
    }}
  </Query>
));
