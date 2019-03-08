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
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

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
      order_by: {tsi: asc}
      where: {
        _and: [
          {oday: {_eq: $date}}
          {tst: {_lte: $maxTime}}
          {tst: {_gte: $minTime}}
          {lat: {_lte: $maxLat}}
          {lat: {_gte: $minLat}}
          {long: {_lte: $maxLong}}
          {long: {_gte: $minLong}}
        ]
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
    const queryParams = getQueryParams();
    const {minTime, maxTime, minLat, maxLat, minLong, maxLong} = queryParams;

    const queryParamsValid =
      Object.keys(queryParams).length > 1 &&
      Object.values(queryParams).every((p) => !!p);

    if (!skip && queryParamsValid) {
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
    const {date, getQueryParams, skip, children} = this.props;
    const queryParams = getQueryParams();
    const {minLat, maxLat, minLong, maxLong, minTime, maxTime} = queryParams;

    const queryParamsValid =
      Object.keys(queryParams).length > 1 &&
      Object.values(queryParams).every((p) => !!p);

    const shouldSkip = skip || !queryParamsValid;

    if (shouldSkip) {
      this.prevResults = [];
    }

    return (
      <Query
        skip={shouldSkip}
        variables={{
          date,
          minTime: minTime ? minTime.toISOString() : null,
          maxTime: maxTime ? maxTime.toISOString() : null,
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
          let groupedEvents = groupBy(
            // First, filter out the null events
            get(data, "vehicles", []).filter(
              // Filter out null positions. Can't draw them on the map.
              (evt) => !!evt && !!evt.lat && !!evt.long
            ),
            getJourneyId
          );

          groupedEvents = sortBy(
            map(
              // Second, group the events by the journey
              groupedEvents,
              // Third, create journey items from the journey groups
              (events, groupName) => {
                const realStartMoment = moment.tz(events[0].tst, TIMEZONE);

                const hfpEvents = events.map((evt) =>
                  createHfpItem(evt, realStartMoment)
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
