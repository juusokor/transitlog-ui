import React from "react";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import {observer, inject} from "mobx-react";
import get from "lodash/get";
import flow from "lodash/flow";
import {app} from "mobx-app";

const enhance = flow(
  observer,
  inject(app("state"))
);

export default (Component) =>
  enhance((props) => {
    // Get the route id from the immediate props or from state.
    const {
      state: {route: stateRoute = {}},
      route = stateRoute,
    } = props;

    const getComponent = (routeProp) => <Component {...props} route={routeProp} />;

    // Can't do anything without a routeId. Or if we have the route, there is no need to fetch it.
    if (
      !get(route, "routeId", "") ||
      (route && route.routeId && route.direction && route.dateBegin)
    ) {
      return getComponent(route);
    }

    // Else, fetch the route.
    return (
      <SingleRouteQuery route={route}>
        {({route: routeObj, loading, error}) => {
          if (error || loading) {
            return getComponent(route);
          }

          return getComponent(routeObj);
        }}
      </SingleRouteQuery>
    );
  });
