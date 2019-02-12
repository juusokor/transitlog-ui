import React from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {createHfpItem} from "../helpers/createHfpItem";
import {observer} from "mobx-react";
import getJourneyId from "../helpers/getJourneyId";
import {removeUpdateListener, setUpdateListener} from "../stores/UpdateManager";

export const journeysByDateQuery = gql`
  query journeysByDateQuery(
    $route_id: String
    $direction: smallint
    $date: date
    $stopId: String
  ) {
    vehicles(
      distinct_on: journey_start_time
      order_by: [{journey_start_time: asc}, {tst: desc}]
      where: {
        oday: {_eq: $date}
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction}
        next_stop_id: {_eq: $stopId}
      }
    ) {
      received_at
      next_stop_id
      oday
      route_id
      direction_id
      journey_start_time
      lat
      long
      drst
      owner_operator_id
      vehicle_number
      is_ongoing
      headsign
      unique_vehicle_id
      mode
      desi
      tst
      tsi
    }
  }
`;

const updateListenerName = "journey list query";

@observer
class JourneysByDateQuery extends React.Component {
  componentWillUnmount() {
    removeUpdateListener(updateListenerName);
  }

  onUpdate = (refetch) => () => {
    const {route, date, skip = false} = this.props;
    const {routeId, direction, originstopId} = route;

    if (route && route.routeId && !skip) {
      refetch({
        route_id: routeId,
        direction: parseInt(direction, 10),
        stopId: originstopId,
        date,
      });
    }
  };

  render() {
    const {children, route, date} = this.props;
    const {routeId, direction, originstopId} = route;

    return (
      <Query
        query={journeysByDateQuery}
        variables={{
          route_id: routeId,
          direction: parseInt(direction, 10),
          stopId: originstopId,
          date,
        }}>
        {({data, error, loading, refetch}) => {
          if (!data || loading) {
            return children({journeys: {}, loading, error});
          }

          const vehicles = get(data, "vehicles", []);

          const journeyItems = vehicles.reduce((journeys, rawEvent) => {
            const event = createHfpItem(rawEvent);
            const journeyId = getJourneyId(event);
            journeys[journeyId] = event;
            return journeys;
          }, {});

          setUpdateListener(updateListenerName, this.onUpdate(refetch), false);
          return children({journeys: journeyItems, loading, error});
        }}
      </Query>
    );
  }
}

export default JourneysByDateQuery;
