import React, {Component} from "react";
import {Query} from "react-apollo";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import map from "lodash/map";
import groupBy from "lodash/groupBy";
import gql from "graphql-tag";
import getJourneyId from "../helpers/getJourneyId";
import {createHfpItem} from "../helpers/createHfpItem";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {timeToSeconds} from "../helpers/time";

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
      order_by: {tst: asc}
      where: {
        oday: {_eq: $date}
        received_at: {_lte: $maxTime, _gte: $minTime}
        lat: {_lte: $maxLat, _gte: $minLat}
        long: {_lte: $maxLong, _gte: $minLong}
      }
    ) {
      journey_start_time
      next_stop_id
      tst
      tsi
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
      __typename
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
    const {date, searchTime, minTime, maxTime, area, skip, children} = this.props;
    const {minLat, maxLat, minLong, maxLong} = area;

    if (skip) {
      this.prevResults = [];
    }

    return (
      <Query
        partialRefetch={true}
        skip={skip}
        variables={{
          date,
          minTime,
          maxTime,
          minLat,
          maxLat,
          minLong,
          maxLong,
        }}
        query={areaHfpQuery}>
        {({loading, data, error, refetch, ...rest}) => {
          if (!data || loading) {
            return children({events: this.prevResults, loading, error, ...rest});
          }

          // Make sure the data is in the same format as the normal hfp events are.
          const groupedEvents = sortBy(
            map(
              // Second, group the events by the journey
              groupBy(
                // First, filter out the null events
                get(data, "vehicles", []).filter(
                  // Filter out null positions. Can't draw them on the map.
                  (evt) => !!evt && !!evt.lat && !!evt.long
                ),
                getJourneyId
              ),
              // Third, create journey items from the journey groups
              (events, groupName) => {
                // The start moment is used in createHfpItem to figure out the 24h+ time for the journey
                const hfpEvents = events.map((evt) =>
                  createHfpItem(evt, searchTime)
                );

                return {
                  journeyId: groupName,
                  journey_start_time: get(hfpEvents, "[0].journey_start_time", ""),
                  events: hfpEvents,
                };
              }
            ),
            // Finally, sort the list by the new 24h+ journey time strings.
            ({journey_start_time = ""}) => timeToSeconds(journey_start_time)
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
