import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import StopFieldsFragment from "./StopFieldsFragment";
import {observer} from "mobx-react";

export const singleStopQuery = gql`
  query singleStopQuery($stop: ID!) {
    stop(nodeId: $stop) {
      ...StopFieldsFragment
    }
  }
  ${StopFieldsFragment}
`;

export default observer(({children, stop}) => (
  <Query query={singleStopQuery} variables={{stop}}>
    {({loading, error, data}) => {
      if (loading) return "Loading...";
      if (error) return "Error!";

      const stop = get(data, "stop", null);

      return children({
        loading,
        error,
        stop,
      });
    }}
  </Query>
));
