import gql from "graphql-tag";

export const RouteFieldsFragment = gql`
  fragment RouteFieldsFragment on Route {
    nodeId
    line {
      nodes {
        dateBegin
        dateEnd
        lineId
      }
    }
    routeId
    direction
    dateBegin
    dateEnd
    destinationFi
    originFi
    nameFi
    destinationstopId
    originstopId
  }
`;

export const ExtensiveRouteFieldsFragment = gql`
  fragment ExtensiveRouteFieldsFragment on Route {
    type
    routeLength
    mode
    originStop: stopByOriginstopId {
      nodeId
      stopId
      lat
      lon
      shortId
      nameFi
      modes {
        nodes
      }
      departures: departuresByStopId(
        condition: {routeId: $routeId, direction: $direction, dayType: $dayType}
      ) {
        nodes {
          stopId
          routeId
          direction
          hours
          minutes
          isNextDay
          arrivalHours
          arrivalMinutes
          departureId
          dateBegin
          dateEnd
          dayType
          terminalTime
          recoveryTime
          equipmentRequired
          equipmentType
          trunkColorRequired
          operatorId
        }
      }
    }
    destinationStop: stopByDestinationstopId {
      nodeId
      stopId
      lat
      lon
      shortId
      nameFi
      modes {
        nodes
      }
      departures: departuresByStopId(
        condition: {routeId: $routeId, direction: $direction, dayType: $dayType}
      ) {
        nodes {
          stopId
          routeId
          direction
          hours
          minutes
          isNextDay
          arrivalHours
          arrivalMinutes
          departureId
          dateBegin
          dateEnd
          dayType
          terminalTime
          recoveryTime
          equipmentRequired
          equipmentType
          trunkColorRequired
          operatorId
        }
      }
    }
    routeSegments {
      nodes {
        stopId
        nextStopId
        dateBegin
        dateEnd
        duration
        stopIndex
        distanceFromPrevious
        distanceFromStart
        destinationFi
        timingStopType
        direction
        routeId
        stop: stopByStopId {
          nameFi
          stopId
          shortId
          stopType
          modes {
            nodes
          }
          departures: departuresByStopId(
            condition: {routeId: $routeId, direction: $direction, dayType: $dayType}
          ) {
            nodes {
              routeId
              direction
              hours
              minutes
              isNextDay
              arrivalHours
              arrivalMinutes
              departureId
              dateBegin
              dateEnd
              dayType
              terminalTime
              recoveryTime
              equipmentRequired
              equipmentType
              trunkColorRequired
              operatorId
            }
          }
        }
      }
    }
  }
`;

export default RouteFieldsFragment;
