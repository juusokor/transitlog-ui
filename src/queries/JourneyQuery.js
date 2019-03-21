import React, {useEffect, useCallback, useMemo} from "react";
import get from "lodash/get";
import pick from "lodash/pick";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {getServerClient} from "../api";

export const journeyQuery = gql`
  query journeyQuery(
    $departureDate: Date!
    $routeId: String!
    $departureTime: Time!
    $direction: Direction!
    $instance: Int = 0
  ) {
    journey(
      routeId: $routeId
      direction: $direction
      departureTime: $departureTime
      departureDate: $departureDate
      instance: $instance
    ) {
      id
      lineId
      routeId
      originStopId
      direction
      departureDate
      departureTime
      uniqueVehicleId
      operatorId
      vehicleId
      instance
      name
      mode
      headsign
      equipment {
        age
        emissionClass
        emissionDesc
        exteriorColor
        id
        operatorId
        operatorName
        registryNr
        type
        vehicleId
      }
      events {
        delay
        doorStatus
        heading
        lat
        lng
        nextStopId
        receivedAt
        recordedAt
        recordedAtUnix
        recordedTime
        velocity
      }
      departures {
        id
        stopId
        dayType
        departureId
        equipmentColor
        equipmentIsRequired
        equipmentType
        extraDeparture
        index
        isNextDay
        isTimingStop
        operatorId
        terminalTime
        recoveryTime
        stop {
          id
          isTimingStop
          lat
          lng
          lineId
          modes
          destination
          distanceFromPrevious
          distanceFromStart
          duration
          name
          originStopId
          radius
          routeId
          shortId
          stopId
          stopIndex
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
          arrivalEvent {
            nextStopId
            receivedAt
            recordedAt
            recordedAtUnix
            recordedTime
          }
        }
        observedDepartureTime {
          departureDate
          departureTime
          departureDateTime
          departureTimeDifference
          departureEvent {
            nextStopId
            receivedAt
            recordedAt
            recordedAtUnix
            recordedTime
          }
        }
        plannedDepartureTime {
          departureDate
          departureTime
          departureDateTime
          isNextDay
        }
      }
    }
  }
`;

const updateListenerName = "selected journey";

const client = getServerClient();

const JourneyQuery = (props) => {
  const queryVars = useMemo(
    () =>
      pick(
        get(props, "journey", {}),
        "routeId",
        "direction",
        "departureDate",
        "departureTime",
        "instance"
      ),
    [props.journey]
  );

  const createRefetcher = useCallback(
    (refetch) => () => {
      const {skip, journey} = props;

      if (journey && !skip) {
        refetch(queryVars);
      }
    },
    [props.skip, queryVars]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  const {skip, journey, children} = props;

  return (
    <Query
      partialRefetch={true}
      client={client}
      skip={skip || !journey}
      query={journeyQuery}
      variables={queryVars}>
      {({data, loading, error, refetch}) => {
        if (!data || loading) {
          return children({journey: null, loading, error});
        }

        setUpdateListener(updateListenerName, createRefetcher(refetch));
        const journey = get(data, "journey", null);

        return children({journey, loading, error});
      }}
    </Query>
  );
};

export default JourneyQuery;
