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
          departureId
          dateBegin
          dateEnd
          dayType
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
          departureId
          dateBegin
          dateEnd
          dayType
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
        stop: stopByStopId {
          nameFi
          stopId
          shortId
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
              departureId
              dateBegin
              dateEnd
              dayType
            }
          }
        }
      }
    }
  }
`;

export default RouteFieldsFragment;
