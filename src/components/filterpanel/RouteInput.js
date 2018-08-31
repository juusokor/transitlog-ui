import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import withRoute from "../../hoc/withRoute";

const getRouteValue = ({
  routeId = "",
  direction = "",
  dateBegin = "",
  dateEnd = "",
}) => `${routeId}/${direction}/${dateBegin}/${dateEnd}`;

@inject(app("Filters"))
@withRoute
@observer
export class RouteInput extends Component {
  onChange = (e) => {
    const {Filters, routes} = this.props;
    const selectedValue = get(e, "target.value", false);

    if (!selectedValue || selectedValue === "///") {
      return Filters.setRoute({});
    }

    const selectedRoute = routes.find((r) => getRouteValue(r) === selectedValue);

    if (selectedRoute) {
      Filters.setRoute(selectedRoute);
    }
  };

  componentDidMount() {
    this.resetRoute();
    this.ensureFullRouteData();
  }

  componentDidUpdate() {
    this.resetRoute();
  }

  /**
   * Reset the selected route if none of the route options match. This means
   * the line has changed and the routes should be refetched.
   */
  resetRoute() {
    const {routes, route} = this.props;
    const currentValue = getRouteValue(route);

    if (
      routes.length !== 0 &&
      routes.every((routeListItem) => getRouteValue(routeListItem) !== currentValue)
    ) {
      this.onChange(false);
    }
  }

  /**
   * Ensure that the pre-selected route has full data
   */
  ensureFullRouteData() {
    const {Filters, route, routes} = this.props;

    // If there is a preset routeId, find the rest of the route data from routes.
    if (route.routeId && route.direction && !route.dateBegin) {
      const currentValue = getRouteValue(route);

      const routeData = routes.find((r) => {
        const {routeId, direction} = r;
        return getRouteValue({routeId, direction}) === currentValue;
      });

      if (routeData) {
        Filters.setRoute(routeData);
      }
    }
  }

  render() {
    const {route, routes} = this.props;

    const options = routes.map((route) => {
      const {
        nodeId,
        routeId,
        direction,
        originFi,
        destinationFi,
        dateBegin,
        dateEnd,
      } = route;

      return {
        key: nodeId,
        value: getRouteValue(route),
        label: `${routeId} - suunta ${direction}, ${originFi} - ${destinationFi} (${dateBegin} - ${dateEnd})`,
      };
    });

    options.unshift({value: "", label: "Valitse reitti..."});

    return (
      <select value={getRouteValue(route)} onChange={this.onChange}>
        {options.map(({key, value, label}) => (
          <option key={`route_select_${key}`} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }
}
