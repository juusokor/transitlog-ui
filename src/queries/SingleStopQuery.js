import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {StopFieldsWithRouteSegmentsFragment} from "./StopFieldsFragment";
import {observer} from "mobx-react";

export const singleStopQuery = gql`
  query singleStopQuery($stop: String!, $date: Date) {
    allStops(condition: {stopId: $stop}, first: 1) {
      nodes {
        ...StopFieldsWithRouteSegmentsFragment
      }
    }
  }
  ${StopFieldsWithRouteSegmentsFragment}
`;

@observer
class SingleStopQuery extends React.Component {
  render() {
    const {children, stop, date, skip} = this.props;

    return (
      <Query skip={skip} query={singleStopQuery} variables={{stop, date}}>
        {({loading, error, data}) => {
          if (!data) {
            return children({
              loading,
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
    );
  }
}

export default SingleStopQuery;
