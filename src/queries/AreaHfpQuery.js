import React, {Component} from "react";
import {Query} from "react-apollo";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import gql from "graphql-tag";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import getJourneyId from "../helpers/getJourneyId";
import {createHfpItem} from "../helpers/createHfpItem";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {sortByOperationDay} from "../helpers/sortByOperationDay";

const areaHfpQuery = gql`
  query areaHfpQuery(
    $date: date!
    $minTime: timestamptz!
    $maxTime: timestamptz!
    $minLat: float8!
    $maxLat: float8!
    $minLong: float8!
    $maxLong: float8!
  ) {
    vehicles(
      order_by: {received_at: asc}
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
      dl
      unique_vehicle_id
      drst
      spd
      mode
      oday
      hdg
      direction_id
      route_id
    }
  }
`;

const updateListenerName = "area hfp query";

class AreaHfpQuery extends Component {
  prevResults = [];

  componentWillUnmount() {
    removeUpdateListener(updateListenerName);
  }

  onUpdate = (refetch) => () => {
    const {date, getQueryParams, skip} = this.props;
    const {minTime, maxTime, ...area} = getQueryParams();
    const {minLat, maxLat, minLong, maxLong} = area;

    if (!skip && Object.keys(area).length !== 0) {
      refetch({
        date,
        minTime: minTime.toISOString(),
        maxTime: maxTime.toISOString(),
        minLat,
        maxLat,
        minLong,
        maxLong,
      });
    }
  };

  render() {
    const {date, minTime, maxTime, area, skip, children} = this.props;
    const {minLat, maxLat, minLong, maxLong} = area;

    if (skip) {
      this.prevResults = [];
    }

    return (
      <Query
        fetchPolicy="no-cache"
        partialRefetch={true}
        skip={skip}
        variables={{date, minTime, maxTime, minLat, maxLat, minLong, maxLong}}
        query={areaHfpQuery}>
        {({loading, data, error, refetch, ...rest}) => {
          if (!data || loading) {
            return children({events: this.prevResults, loading, error, ...rest});
          }

          // Make sure the data is in the same format as the normal hfp events are.
          const groupedEvents = sortBy(
            groupHfpPositions(
              get(data, "vehicles", [])
                .filter(
                  // Filter out null positions. Can't draw them on the map.
                  (evt) => !!evt && !!evt.lat && !!evt.long
                )
                .map(createHfpItem),
              getJourneyId,
              "journeyId"
            ),
            ({journey_start_time = ""}) => sortByOperationDay(journey_start_time)
          );

          this.prevResults = groupedEvents;
          setUpdateListener(updateListenerName, this.onUpdate(refetch));

          return children({events: groupedEvents, loading, error, ...rest});
        }}
      </Query>
    );
  }
}

export default AreaHfpQuery;
