import React from "react";
import get from "lodash/get";
import flow from "lodash/flow";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import {observer, inject} from "mobx-react";
import {Query} from "react-apollo";
import {app} from "mobx-app";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";

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

const updateCallbackName = "selected journey";

@inject(app("state"))
@observer
class SelectedJourneyQuery extends React.Component {
  componentWillUnmount() {
    removeUpdateListener(updateCallbackName);
  }

  onUpdate = (refetch) => () => {
    const {
      state: {selectedJourney},
      skip,
    } = this.props;

    if (selectedJourney && !skip) {
      refetch(selectedJourney);
    }
  };

  render() {
    const {
      state: {pollingEnabled},
      skip,
      selectedJourney,
      children,
    } = this.props;
    return (
      <Query
        partialRefetch={true}
        pollInterval={pollingEnabled ? 3000 : 0}
        skip={skip || !selectedJourney}
        query={hfpQuery}
        variables={selectedJourney}>
        {({data, loading, error, refetch}) => {
          setUpdateListener(updateCallbackName, this.onUpdate(refetch));

          const vehicles = get(data, "vehicles", []);
          return children({positions: vehicles, loading, error});
        }}
      </Query>
    );
  }
}

export default SelectedJourneyQuery;
