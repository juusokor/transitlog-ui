import React, {Component} from "react";
import get from "lodash/get";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import {createRouteId} from "../helpers/keys";
import {getServerClient} from "../api";

const routeQuery = gql`
  query routeQuery($routeId: String!, $direction: Direction!, $date: Date!) {
    routeGeometry(routeId: $routeId, direction: $direction, date: $date) {
      coordinates {
        lat
        lng
      }
    }
  }
`;

const client = getServerClient();

// No @observer here, as it doesn't like shouldComponentUpdate
class RouteGeometryQuery extends Component {
  shouldComponentUpdate({route: nextRoute}) {
    const {route} = this.props;
    return !!route.routeId && createRouteId(route) !== createRouteId(nextRoute); // Stop the map from flashing and thrashing
  }

  render() {
    const {route = {}, children, date} = this.props;
    const {routeId = "", direction} = route;

    return (
      <Query
        client={client}
        skip={!routeId}
        query={routeQuery}
        variables={{
          routeId,
          direction,
          date,
        }}>
        {({loading, error, data}) => {
          if (loading || error) {
            return null;
          }

          const coordinates = get(data, "routeGeometry.coordinates", []);
          return children({routeGeometry: coordinates});
        }}
      </Query>
    );
  }
}

export default RouteGeometryQuery;
