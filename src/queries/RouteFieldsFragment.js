import gql from "graphql-tag";
import {StopFieldsFragment} from "./StopFieldsFragment";

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
      ...StopFieldsFragment
      departures: departuresByStopId(
        condition: {
          routeId: $routeId
          direction: $direction
          dayType: $dayType
          isNextDay: $isNextDay
          # Limit the origin stop departures to ones matching the journey time
          hours: $departureHours
          minutes: $departureMinutes
        }
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
      ...StopFieldsFragment
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
          ...StopFieldsFragment
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
      }
    }
  }
  ${StopFieldsFragment}
`;

export default RouteFieldsFragment;
