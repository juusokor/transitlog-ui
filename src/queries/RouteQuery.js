import React, {Component} from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {StopFieldsFragment} from "./StopFieldsFragment";

const routeQuery = gql`
  query routeQuery(
    $routeId: String!
    $direction: String!
    $dateBegin: Date!
    $dateEnd: Date!
  ) {
    route: routeByRouteIdAndDirectionAndDateBeginAndDateEnd(
      routeId: $routeId
      direction: $direction
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      nodeId
      originstopId
      dateBegin
      dateEnd
      geometries {
        nodes {
          geometry
        }
      }
      routeSegments {
        nodes {
          nodeId
          timingStopType
          dateBegin
          dateEnd
          stopIndex
          distanceFromPrevious
          distanceFromStart
          stop: stopByStopId {
            ...StopFieldsFragment
          }
        }
      }
    }
  }
  ${StopFieldsFragment}
`;

// No @observer here, as it doesn't like shouldComponentUpdate
class RouteQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string,
      direction: PropTypes.string,
      dateBegin: PropTypes.string,
      dateEnd: PropTypes.string,
    }).isRequired,
    hfpPositions: PropTypes.arrayOf(
      PropTypes.shape({
        lat: PropTypes.number,
        long: PropTypes.number,
      })
    ),
    children: PropTypes.func.isRequired,
  };

  static defaultProps = {
    route: {},
  };

  shouldComponentUpdate({route}) {
    return !!route.routeId; // Stop the map from flashing and thrashing
  }

  render() {
    const {route = {}, children} = this.props;
    const {routeId, direction, dateBegin, dateEnd} = route;

    return (
      <Query
        query={routeQuery}
        variables={{
          routeId,
          direction,
          dateBegin,
          dateEnd,
        }}>
        {({loading, error, data}) => {
          if (loading || error) {
            return null;
          }

          const positions = get(
            data,
            "route.geometries.nodes[0].geometry.coordinates",
            []
          );

          const stops = get(data, "route.routeSegments.nodes", []).map(
            (segment) => ({
              ...segment.stop,
              timingStopType: segment.timingStopType,
              dateBegin: segment.dateBegin,
              dateEnd: segment.dateEnd,
              stopIndex: segment.stopIndex,
              distanceFromPrevious: segment.distanceFromPrevious,
              distanceFromStart: segment.distanceFromStart,
            })
          );

          return children({routeGeometry: positions, stops});
        }}
      </Query>
    );
  }
}

export default RouteQuery;
