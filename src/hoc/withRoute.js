import React from "react";
import {fetchSingleRoute} from "../queries/SingleRouteQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import compact from "lodash/compact";
import {autorun} from "mobx";

function shouldFetch(route) {
  if (!get(route, "routeId", null)) {
    return false;
  }

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
  return presentParts >= 2 && presentParts !== 5;
}

export default (Component) => {
  @inject(app("Filters"))
  @observer
  class WithRouteComponent extends React.Component {
    disposeReaction = () => {};

    componentDidMount() {
      this.disposeReaction = autorun(() => {
        const {route} = this.props.state;
        if (shouldFetch(route)) {
          this.updateRoute(route);
        }
      });
    }

    componentWillUnmount() {
      if (typeof this.disposeReaction === "function") {
        this.disposeReaction();
      }
    }

    updateRoute = async (route) => {
      const {
        Filters,
        state: {date},
      } = this.props;

      const fetchedRoute = await fetchSingleRoute(route, date);
      const stateRoute = this.props.state.route;

      if (fetchedRoute && stateRoute.routeId === fetchedRoute.routeId) {
        Filters.setRoute(fetchedRoute);
      }
    };

    render() {
      const {
        state: {route},
      } = this.props;

      return <Component {...this.props} route={route} />;
    }
  }

  return WithRouteComponent;
};
