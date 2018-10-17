import React from "react";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import {observer, inject} from "mobx-react";
import get from "lodash/get";
import {app} from "mobx-app";

// Prevent update loops
let routeEnsured = "";

export default (Component) => {
  @inject(app("Filters"))
  @observer
  class WithRouteComponent extends React.Component {
    /**
     * This is necessary to ensure that the full route data is in the selected
     * route state. Filters.setRoute also sets the relevant line from the route
     * data, so this method also ensures that the line matches the route.
     */
    ensureRouteIsSelected = () => {
      const {
        state: {route: stateRoute = {routeId: ""}},
        route = stateRoute,
        Filters,
      } = this.props;

      if (
        route &&
        route.routeId &&
        route.direction &&
        route.dateBegin &&
        route.originstopId &&
        routeEnsured !== route.routeId
      ) {
        routeEnsured = route.routeId;
        Filters.setRoute(route);
      }
    };

    componentDidMount() {
      this.ensureRouteIsSelected();
    }

    componentDidUpdate() {
      this.ensureRouteIsSelected();
    }

    render() {
      const {
        state: {route: stateRoute = {routeId: ""}, date},
        route = stateRoute,
      } = this.props;

      // Can't do anything without a routeId. Or if we have the route,
      // there is no need to fetch it.
      if (
        !get(route, "routeId", "") ||
        (route && route.routeId && route.direction && route.dateBegin)
      ) {
        const useRoute = !!route ? route : {routeId: ""};
        return <Component {...this.props} route={useRoute} />;
      }

      // Allow fetched route to be ensured.
      routeEnsured = "";

      // Else, fetch the full route data.
      return (
        <SingleRouteQuery route={route} date={date}>
          {({route: routeObj, loading, error}) => {
            if (error || loading) {
              return <Component {...this.props} route={{routeId: ""}} />;
            }

            return <Component {...this.props} route={routeObj} />;
          }}
        </SingleRouteQuery>
      );
    }
  }

  return WithRouteComponent;
};
