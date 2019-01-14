import React from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import {observer} from "mobx-react";
import {Query} from "react-apollo";

export const hfpQuery = gql`
  query selectedJourneyQuery(
    $oday: date!
    $route_id: String
    $journey_start_time: time
    $direction_id: smallint
  ) {
    vehicles(
      order_by: {received_at: asc}
      where: {
        oday: {_eq: $oday}
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction_id}
        journey_start_time: {_eq: $journey_start_time}
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

export const SelectedJourneyQuery = observer(({skip, selectedJourney, children}) => {
  return (
    <Query
      skip={skip || !selectedJourney}
      query={hfpQuery}
      variables={selectedJourney}>
      {({data, loading, error}) => {
        const vehicles = get(data, "vehicles", []);
        return children({positions: vehicles, loading, error});
      }}
    </Query>
  );
});
