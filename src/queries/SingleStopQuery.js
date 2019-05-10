import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {StopFieldsFragment} from "./StopFieldsFragment";
import {AlertFieldsFragment} from "./AlertFieldsFragment";

export const singleStopQuery = gql`
  query singleStopQuery($stopId: String!, $date: Date!) {
    stop(date: $date, stopId: $stopId) {
      ...StopFieldsFragment
      alerts {
        ...AlertFieldsFragment
      }
    }
  }
  ${StopFieldsFragment}
  ${AlertFieldsFragment}
`;

const SingleStopQuery = ({children, stopId, date, skip}) => {
  return (
    <Query skip={skip || !stopId} query={singleStopQuery} variables={{stopId, date}}>
      {({loading, error, data}) => {
        if (!data) {
          return children({
            loading,
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
  );
};

export default SingleStopQuery;
