import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import getJourneyId from "../helpers/getJourneyId";
import {createHfpItem} from "../helpers/hfpQueryManager";

const areaHfpQuery = gql`
  query stopDelay(
    $date: date!
    $minTime: timestamptz!
    $maxTime: timestamptz!
    $minLat: float8!
    $maxLat: float8!
    $minLong: float8!
    $maxLong: float8!
  ) {
    vehicles(
      order_by: received_at_asc
      where: {
        oday: {_eq: $date}
        received_at: {_lte: $maxTime, _gte: $minTime}
        lat: {_lte: $maxLat, _gte: $minLat}
        long: {_lte: $maxLong, _gte: $minLong}
      }
    ) {
      journey_start_time
      next_stop_id
      received_at
      lat
      long
      unique_vehicle_id
      drst
      spd
      mode
      oday
      direction_id
      route_id
    }
  }
`;

@observer
class AreaHfpQuery extends Component {
  render() {
    const {date, minTime, maxTime, area, skip, children} = this.props;

    const {minLat, maxLat, minLong, maxLong} = area;

    return (
      <Query
        skip={skip}
        client={hfpClient}
        variables={{date, minTime, maxTime, minLat, maxLat, minLong, maxLong}}
        query={areaHfpQuery}>
        {({loading, data, error}) => {
          if (loading || error) {
            return children({events: [], loading, error});
          }

          // Make sure the data is in the same format as the normal hfp events are.
          const groupedEvents = groupHfpPositions(
            get(data, "vehicles", [])
              .filter(
                // Filter out null positions. Can't draw them on the map.
                (evt) => !!evt && !!evt.lat && !!evt.long
              )
              .map(createHfpItem),
            getJourneyId,
            "journeyId"
          );

          return children({events: groupedEvents, loading, error});
        }}
      </Query>
    );
  }
}

export default AreaHfpQuery;
