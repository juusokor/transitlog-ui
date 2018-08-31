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
    getRoute = () => {
      const {
        state: {route: stateRoute = {routeId: ""}},
        route = stateRoute,
      } = this.props;

      return route;
    };

    /**
     * This is necessary to ensure that the full route data is in the selected
     * route state. Filters.setRoute also sets the relevant line from the route
     * data, so this method also ensures that the line matches the route.
     */
    ensureRouteIsSelected = () => {
      const {Filters} = this.props;
      const route = this.getRoute();

      if (
        route &&
        route.routeId &&
        route.direction &&
        route.dateBegin &&
        routeEnsured !== route.routeId
      ) {
        routeEnsured = route.routeId;
        Filters.setRoute(route);
      }
    };

    getComponent = (routeProp) => <Component {...this.props} route={routeProp} />;

    componentDidMount() {
      this.ensureRouteIsSelected();
    }

    componentDidUpdate() {
      this.ensureRouteIsSelected();
    }

    render() {
      // Get the route id from the immediate props or from state.
      const route = this.getRoute();

      // Can't do anything without a routeId. Or if we have the route,
      // there is no need to fetch it.
      if (
        !get(route, "routeId", "") ||
        (route && route.routeId && route.direction && route.dateBegin)
      ) {
        return this.getComponent(route);
      }

      // Allow fetched route to be ensured.
      routeEnsured = "";

      // Else, fetch the full route data.
      return (
        <SingleRouteQuery route={route}>
          {({route: routeObj, loading, error}) => {
            if (error || loading) {
              return this.getComponent(route);
            }

            return this.getComponent(routeObj);
          }}
        </SingleRouteQuery>
      );
    }
  }

  return WithRouteComponent;
};
