import React from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {createHfpItem} from "../helpers/createHfpItem";
import {observer} from "mobx-react";
import getJourneyId from "../helpers/getJourneyId";

export const journeysByDateQuery = gql`
  query journeysByDateQuery(
    $route_id: String
    $direction: smallint
    $date: date
    $stopId: String
  ) {
    vehicles(
      distinct_on: journey_start_time
      order_by: [{journey_start_time: asc}, {received_at: desc}]
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
    }
  }
`;

@observer
class JourneysByDateQuery extends React.Component {
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
        {({data, error, loading}) => {
          if (!data || loading) {
            return children({journeys: {}, loading, error});
          }

          const vehicles = get(data, "vehicles", []);
          const journeyItems = vehicles.reduce((journeys, event) => {
            const journeyId = getJourneyId(event);
            journeys[journeyId] = createHfpItem(event);
            return journeys;
          }, {});

          return children({journeys: journeyItems, loading, error});
        }}
      </Query>
    );
  }
}

export default JourneysByDateQuery;
