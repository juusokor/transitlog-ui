import React, {useCallback, useEffect} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer} from "mobx-react-lite";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {getServerClient} from "../api";

export const routeJourneysQuery = gql`
  query routeJourneysQuery(
    $routeId: String!
    $direction: Direction!
    $date: Date!
    $stopId: String!
  ) {
    departures(
      filter: {routeId: $routeId, direction: $direction}
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
      journey {
        id
        departureDate
        departureTime
        direction
        instance
        routeId
        originStopId
        uniqueVehicleId
        _multipleInstances
      }
      plannedArrivalTime {
        arrivalDate
        arrivalDateTime
        arrivalTime
        isNextDay
      }
      observedArrivalTime {
        arrivalDate
        arrivalDateTime
        arrivalTime
        arrivalTimeDifference
        doorDidOpen
      }
      plannedDepartureTime {
        departureDate
        departureDateTime
        departureTime
        isNextDay
      }
      observedDepartureTime {
        departureDate
        departureDateTime
        departureTime
        departureTimeDifference
      }
    }
  }
`;

const updateListenerName = "journey list query";

const client = getServerClient();

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
      client={client}
      query={routeJourneysQuery}
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

        const departures = get(data, "departures", []);

        setUpdateListener(updateListenerName, createRefetcher(refetch), false);
        return children({departures, loading, error});
      }}
    </Query>
  );
});

export default JourneysByDateQuery;
