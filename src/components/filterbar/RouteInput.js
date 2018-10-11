import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {get} from "lodash";
import withRoute from "../../hoc/withRoute";
import {text} from "../../helpers/text";
import Dropdown from "../Dropdown";

const getRouteValue = ({
  routeId = "",
  direction = "",
  dateBegin = "",
  dateEnd = "",
}) => {
  const valueParts = [routeId, direction, dateBegin, dateEnd];

  if (valueParts.every((part) => !!part)) {
    return valueParts.join("/");
  }

  return "";
};

@inject(app("Filters"))
@withRoute
@observer
class RouteInput extends Component {
  onChange = (e) => {
    const {Filters, routes} = this.props;
    const selectedValue = get(e, "target.value", false);

    if (!selectedValue) {
      return Filters.setRoute({});
    }

    const route = routes.find((r) => getRouteValue(r) === selectedValue);

    if (route) {
      Filters.setRoute(route);
    }
  };

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

  render() {
    const {route, routes} = this.props;

    const options = routes.map((routeOption) => {
      const {
        nodeId,
        routeId,
        direction,
        originFi,
        destinationFi,
        dateBegin,
        dateEnd,
      } = routeOption;

      return {
        key: nodeId,
        value: getRouteValue(routeOption),
        label: `${routeId} - suunta ${direction}, ${originFi} - ${destinationFi} (${dateBegin} - ${dateEnd})`,
      };
    });

    options.unshift({value: "", label: ""});
    const currentValue = getRouteValue(route);

    return (
      <Dropdown value={currentValue} onChange={this.onChange}>
        {options.map(({key, value, label}) => (
          <option key={`route_select_${key}`} value={value}>
            {label}
          </option>
        ))}
      </Dropdown>
    );
  }
}

export default RouteInput;
