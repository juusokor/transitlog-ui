import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {get} from "lodash";
import compact from "lodash/compact";
import withRoute from "../../hoc/withRoute";
import {text} from "../../helpers/text";

const getRouteValue = ({
  routeId = "",
  direction = "",
  dateBegin = "",
  dateEnd = "",
}) => {
  const valueParts = compact([routeId, direction, dateBegin, dateEnd]);

  if (valueParts.length !== 0) {
    return valueParts.join("/");
  }

  return "";
};

@inject(app("Filters"))
@withRoute
@observer
class RouteInput extends Component {
  onChange = (e) => {
    const {Filters} = this.props;
    const selectedValue = get(e, "target.value", false);

    if (!selectedValue) {
      return Filters.setRoute({});
    }

    const [routeId, direction, dateBegin, dateEnd] = selectedValue.split("/");
    Filters.setRoute({routeId, direction, dateBegin, dateEnd});
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

    options.unshift({value: "", label: text("filterpanel.select_route")});
    const currentValue = getRouteValue(route);

    return (
      <select value={currentValue} onChange={this.onChange}>
        {options.map(({key, value, label}) => (
          <option key={`route_select_${key}`} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }
}

export default RouteInput;
