import React, {Component} from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";

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
      geometries {
        nodes {
          geometry
        }
      }
    }
  }
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

          return children({routeGeometry: positions});
        }}
      </Query>
    );
  }
}

export default RouteQuery;
