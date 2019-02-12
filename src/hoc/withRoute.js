import React from "react";
import {withApollo} from "react-apollo";
import {SimpleRouteQuery} from "../queries/SingleRouteQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import compact from "lodash/compact";
import {createRouteId} from "../helpers/keys";

function shouldFetch(route) {
  if (!get(route, "routeId", null)) {
    return false;
  }

  const requiredParts = [
    get(route, "routeId", ""),
    get(route, "direction", ""),
    get(route, "dateBegin", ""),
    get(route, "dateEnd", ""),
    get(route, "originstopId", ""),
  ];

  const presentParts = compact(requiredParts).length;

  // RouteId and direction are required for fetching, so we shouldFetch
  // if we have at least two parts but less than all parts present.
  return presentParts >= 2 && presentParts !== 5;
}

/*
  The component fetches the route and puts it into the state. The idea is to
  flesh out the state data with the route's dateBegin, dateEnd and originstopId
  data that is required for some queries, since the state might otherwise
  only contain routeId and direction.
 */

// The state route only contains partial data. Store fetched route items here
// so that it can be given as a prop in case some component needs more data.
let prevRoute = null;

export default (opts = {alwaysFetch: false}) => (Component) => {
  @inject(app("Filters"))
  @withApollo
  @observer
  class WithRouteComponent extends React.Component {
    updateRoute = (fetchedRoute) => {
      const {
        Filters,
        state: {route: stateRoute},
      } = this.props;

      if (
        shouldFetch(stateRoute) &&
        fetchedRoute &&
        createRouteId(stateRoute) === createRouteId(fetchedRoute)
      ) {
        prevRoute = fetchedRoute;
        Filters.setRoute(fetchedRoute);
      }
    };

    render() {
      const {
        state: {date, route: stateRoute},
      } = this.props;

      return (
        <SimpleRouteQuery
          route={stateRoute}
          date={date}
          skip={shouldFetch(stateRoute) === false && opts.alwaysFetch === false}
          onCompleted={this.updateRoute}>
          {({route}) => {
            const useRoute = route || prevRoute;

            // Ensure that the fetched route matches the state route
            // to prevent async shenaningans.
            const returnRoute =
              useRoute && createRouteId(useRoute) === createRouteId(stateRoute)
                ? useRoute
                : stateRoute;

            return <Component {...this.props} route={returnRoute} />;
          }}
        </SimpleRouteQuery>
      );
    }
  }

  return WithRouteComponent;
};
