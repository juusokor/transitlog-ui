import React, {useRef} from "react";
import {observer} from "mobx-react-lite";
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

const StopsByBboxQuery = observer((props) => {
  const {children, bbox, skip} = props;
  const prevResult = useRef([]);

  return (
    <Query client={client} skip={skip} query={stopsByBboxQuery} variables={{bbox}}>
      {({loading, data, error}) => {
        if (loading) return children({stops: prevResult.current, loading: true});
        if (error) return children({stops: prevResult.current, loading: false});

        const stops = get(data, "stopsByBbox", []);
        // Stop the stops from disappearing while loading
        prevResult.current = stops;
        return children({stops, loading: false});
      }}
    </Query>
  );
});

export default StopsByBboxQuery;
