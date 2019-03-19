import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {getServerClient} from "../api";
import {StopFieldsFragment} from "./StopFieldsFragment";

export const stopsByBboxQuery = gql`
  query stopsByBboxQuery($bbox: BBox!, $date: Date) {
    stops(filter: {bbox: $bbox}, date: $date) {
      ...StopFieldsFragment
    }
  }
  ${StopFieldsFragment}
`;

const client = getServerClient();

@observer
class StopsByBboxQuery extends Component {
  prevQueryResult = [];

  render() {
    const {children, bbox, date, skip} = this.props;

    return (
      <Query
        client={client}
        skip={skip}
        query={stopsByBboxQuery}
        variables={{bbox, date}}>
        {({loading, data, error}) => {
          if (loading) return children({stops: this.prevQueryResult, loading: true});
          if (error) return children({stops: this.prevQueryResult, loading: false});

          const stops = get(data, "stops", []);
          // Stop the stops from disappearing while loading
          this.prevQueryResult = stops;
          return children({stops, loading: false});
        }}
      </Query>
    );
  }
}

export default StopsByBboxQuery;
