import React from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import {observer, inject} from "mobx-react";
import {Query} from "react-apollo";
import {app} from "mobx-app";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {getNormalTime} from "../helpers/time";
import moment from "moment-timezone";

export const hfpQuery = gql`
  query selectedJourneyQuery(
    $oday: date!
    $route_id: String
    $journey_start_time: time
    $direction_id: smallint
    $compareReceivedAt: timestamptz_comparison_exp
  ) {
    vehicles(
      order_by: {received_at: asc}
      where: {
        oday: {_eq: $oday}
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction_id}
        journey_start_time: {_eq: $journey_start_time}
        received_at: $compareReceivedAt
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

const updateListenerName = "selected journey";

@inject(app("state"))
@observer
class SelectedJourneyQuery extends React.Component {
  componentWillUnmount() {
    removeUpdateListener(updateListenerName);
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
    const {skip, selectedJourney, children} = this.props;

    const journeyStartTime = get(selectedJourney, "journey_start_time", "");
    const normalStartTime = getNormalTime(journeyStartTime);
    const isNextDay = normalStartTime !== journeyStartTime;

    const queryVars = {
      ...selectedJourney,
      journey_start_time: normalStartTime,
      compareReceivedAt: isNextDay
        ? {
            _gt: moment
              .tz(get(selectedJourney, "oday", 0), "Europe/Helsinki")
              .toISOString(),
          }
        : undefined,
    };

    return (
      <Query skip={skip || !selectedJourney} query={hfpQuery} variables={queryVars}>
        {({data, loading, error, refetch}) => {
          if (!loading) {
            setUpdateListener(updateListenerName, this.onUpdate(refetch));
          }

          const vehicles = get(data, "vehicles", []);
          return children({positions: vehicles, loading, error});
        }}
      </Query>
    );
  }
}

export default SelectedJourneyQuery;
