import React, {Component} from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {getServerClient} from "../api";

export const stopsByBboxQuery = gql`
  query stopsByBboxQuery($bbox: BBox!) {
    stopsByBbox(bbox: $bbox) {
      id
      stopId
      shortId
      lat
      lng
      name
      radius
      modes
    }
  }
`;

const client = getServerClient();

@observer
class StopsByBboxQuery extends Component {
  prevQueryResult = [];

  render() {
    const {children, bbox, skip} = this.props;

    return (
      <Query client={client} skip={skip} query={stopsByBboxQuery} variables={{bbox}}>
        {({loading, data, error}) => {
          if (loading) return children({stops: this.prevQueryResult, loading: true});
          if (error) return children({stops: this.prevQueryResult, loading: false});

          const stops = get(data, "stopsByBbox", []);
          // Stop the stops from disappearing while loading
          this.prevQueryResult = stops;
          return children({stops, loading: false});
        }}
      </Query>
    );
  }
}

export default StopsByBboxQuery;
