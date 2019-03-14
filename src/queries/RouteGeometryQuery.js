import React, {Component} from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {createRouteId, createRouteKey} from "../helpers/keys";
import {getValidItemsByDateChains} from "../helpers/filterJoreCollections";

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

// TODO: Migrate this query to use transitlog-server.

// No @observer here, as it doesn't like shouldComponentUpdate
class RouteGeometryQuery extends Component {
  shouldComponentUpdate({route: nextRoute}) {
    const {route} = this.props;
    return !!route.routeId && createRouteKey(route) !== createRouteKey(nextRoute); // Stop the map from flashing and thrashing
  }

  render() {
    const {route = {}, children, date} = this.props;
    const {routeId = "", direction} = route;

    return (
      <Query
        skip={!routeId}
        query={routeQuery}
        variables={{
          routeId,
          direction,
        }}>
        {({loading, error, data}) => {
          if (loading || error) {
            return null;
          }

          const geometries = get(data, "route.geometries.nodes", []);
          let geometry = getValidItemsByDateChains([geometries], date)[0];

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
