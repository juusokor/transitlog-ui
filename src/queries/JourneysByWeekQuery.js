import React, {useCallback, useEffect} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer} from "mobx-react-lite";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";

export const routeJourneysByWeekQuery = gql`
  query journeysByWeekQuery(
    $routeId: String!
    $direction: Direction!
    $date: Date!
    $stopId: String!
  ) {
    weeklyDepartures(
      routeId: $routeId
      direction: $direction
      date: $date
      stopId: $stopId
    ) {
      id
      index
      isNextDay
      isTimingStop
      dayType
      departureId
      equipmentColor
      equipmentType
      extraDeparture
      operatorId
      terminalTime
      recoveryTime
      routeId
      direction
      stopId
      mode
      journey {
        id
        departureDate
        departureTime
        direction
        routeId
        originStopId
        uniqueVehicleId
        mode
        _numInstance
      }
      plannedDepartureTime {
        id
        departureDate
        departureDateTime
        departureTime
        isNextDay
      }
      observedDepartureTime {
        id
        departureDate
        departureDateTime
        departureTime
        departureTimeDifference
      }
    }
  }
`;

const updateListenerName = "journey weel query";

const JourneysByDateQuery = observer(({children, route, date, skip}) => {
  const createRefetcher = useCallback(
    (refetch) => () => {
      const {routeId, direction, originStopId} = route;

      if (refetch && route && route.routeId && !skip) {
        refetch({
          routeId,
          direction: parseInt(direction, 10),
          stopId: originStopId,
          date,
        });
      }
    },
    [route, date]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);
  const {routeId, direction, originStopId} = route;

  return (
    <Query
      fetchPolicy="cache-and-network"
      query={routeJourneysByWeekQuery}
      variables={{
        routeId: routeId,
        direction: parseInt(direction, 10),
        stopId: originStopId,
        date,
      }}>
      {({data, error, loading, refetch}) => {
        if (!data || loading) {
          return children({departures: [], loading, error});
        }

        const departures = get(data, "weeklyDepartures", []);

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);
        return children({departures, loading, error});
      }}
    </Query>
  );
});

export default JourneysByDateQuery;
