import React from "react";
import {fetchSingleRoute} from "../queries/SingleRouteQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {fromPromise} from "mobx-utils";
import {createRouteKey} from "../helpers/hfpCache";
import get from "lodash/get";
import compact from "lodash/compact";

function shouldFetch(route) {
  const requiredParts = [
    get(route, "routeId", null),
    get(route, "direction", null),
    get(route, "dateBegin", null),
    get(route, "dateEnd", null),
    get(route, "originstopId", null),
  ];

  const presentParts = compact(requiredParts).length;

  // RouteId and direction are required for fetching, so we shouldFetch
  // if we have at least two parts but less than all parts present.
  return presentParts > 1 && presentParts !== 5;
}

// Prevent update loops
let routeEnsured = "";
let previouslyFetchedRoute = null;

const createRoutePromise = (value = null) => fromPromise.resolve(value);

export default (Component) => {
  @inject(app("Filters"))
  @observer
  class WithRouteComponent extends React.Component {
    routePromise = createRoutePromise();
    currentFetchKey = "";

    updatePromise = (route) => {
      const {
        state: {date},
      } = this.props;

      if (this.routePromise.state === "pending") {
        return;
      }

      if (!shouldFetch(route)) {
        const routeKey = createRouteKey(route);

        if (routeKey !== this.currentFetchKey) {
          this.routePromise = createRoutePromise(route);
          this.ensureRouteIsSelected(route);
          this.currentFetchKey = routeKey;
        }

        return;
      }

      routeEnsured = "";

      this.routePromise = fromPromise(
        fetchSingleRoute(route, date).then((route) => {
          this.ensureRouteIsSelected(route);
          this.currentFetchKey = createRouteKey(route);
          return route;
        })
      );

      this.currentFetchKey = "";
    };

    /**
     * This is necessary to ensure that the full route data is in the selected
     * route state. Filters.setRoute also sets the relevant line from the route
     * data, so this method also ensures that the line matches the route.
     */
    ensureRouteIsSelected = (route) => {
      const {
        state: {route: stateRoute = {routeId: ""}},
        Filters,
      } = this.props;

      if (
        route &&
        route.routeId === stateRoute.routeId &&
        routeEnsured !== route.routeId
      ) {
        routeEnsured = route.routeId;
        Filters.setRoute(route);
      }
    };

    getComponent = (route, loading) => (
      <Component
        key="withRouteComponent"
        {...this.props}
        route={route}
        loading={loading}
      />
    );

    render() {
      const {
        state: {route: stateRoute},
        route = stateRoute,
      } = this.props;

      this.updatePromise(route);

      return this.routePromise.case({
        pending: () => this.getComponent(previouslyFetchedRoute, true),
        rejected: () => this.getComponent(previouslyFetchedRoute, false),
        fulfilled: (route) => this.getComponent(route, false),
      });
    }
  }

  return WithRouteComponent;
};
