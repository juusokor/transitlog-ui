import React from "react";
import get from "lodash/get";
import pick from "lodash/pick";
import groupBy from "lodash/groupBy";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import {observer, inject} from "mobx-react";
import {Query} from "react-apollo";
import {app} from "mobx-app";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {getNormalTime} from "../helpers/time";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

export const hfpQuery = gql`
  query selectedJourneyQuery(
    $oday: date!
    $route_id: String!
    $journey_start_time: time!
    $direction_id: smallint!
    $unique_vehicle_id: String
    $compareReceivedAt: timestamptz_comparison_exp
  ) {
    vehicles(
      order_by: {tst: asc}
      where: {
        oday: {_eq: $oday}
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction_id}
        journey_start_time: {_eq: $journey_start_time}
        unique_vehicle_id: {_eq: $unique_vehicle_id}
        tst: $compareReceivedAt
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
      ...pick(
        selectedJourney,
        "route_id",
        "direction_id",
        "journey_start_time",
        "oday"
      ),
      unique_vehicle_id: get(selectedJourney, "unique_vehicle_id") || undefined,
      journey_start_time: normalStartTime,
      compareReceivedAt: isNextDay
        ? {
            _gt: moment.tz(get(selectedJourney, "oday", 0), TIMEZONE).toISOString(),
          }
        : undefined,
    };

    return (
      <Query
        partialRefetch={true}
        skip={skip || !selectedJourney}
        query={hfpQuery}
        variables={queryVars}>
        {({data, loading, error, refetch}) => {
          if (!data || loading) {
            return children({positions: [], loading, error});
          }

          setUpdateListener(updateListenerName, this.onUpdate(refetch));

          let vehicles = get(data, "vehicles", []);

          // If there is multiple instances of the journey and the selected journey
          // was not fetched with a vehicle ID, get the relevant journey
          // instance from the result.
          if (
            selectedJourney &&
            selectedJourney.instance &&
            !selectedJourney.unique_vehicle_id
          ) {
            const vehicleGroups = Object.values(
              groupBy(vehicles, "unique_vehicle_id")
            );

            if (vehicleGroups.length > 1) {
              vehicles = vehicleGroups[selectedJourney.instance];
            }
          }

          return children({positions: vehicles, loading, error});
        }}
      </Query>
    );
  }
}

export default SelectedJourneyQuery;
