import React, {Component} from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {createRouteId, createRouteKey} from "../helpers/keys";

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
      routeId
      direction
      geometries {
        nodes {
          geometry
          dateBegin
          dateEnd
        }
      }
    }
  }
`;

// No @observer here, as it doesn't like shouldComponentUpdate
class RouteGeometryQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string.isRequired,
      direction: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      dateBegin: PropTypes.string.isRequired,
      dateEnd: PropTypes.string.isRequired,
    }).isRequired,
    date: PropTypes.string,
    children: PropTypes.func.isRequired,
  };

  static defaultProps = {
    route: {},
  };

  shouldComponentUpdate({route: nextRoute}) {
    const {route} = this.props;
    return !!route.routeId && createRouteKey(route) !== createRouteKey(nextRoute); // Stop the map from flashing and thrashing
  }

  render() {
    const {route = {}, children} = this.props;
    const {routeId = "", direction, dateBegin = "", dateEnd = ""} = route;

    return (
      <Query
        skip={!routeId || !dateBegin}
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

          const geometries = get(data, "route.geometries.nodes", []);
          const geometry = geometries.find(
            ({dateBegin: geomDateBegin, dateEnd: geomDateEnd}) =>
              geomDateBegin === dateBegin && geomDateEnd === dateEnd
          );

          const coordinates = get(geometry, "geometry.coordinates", []).map(
            ([lon, lat]) => [lat, lon]
          );

          return children({routeGeometry: coordinates});
        }}
      </Query>
    );
  }
}

export default RouteGeometryQuery;
