import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {get} from "lodash";
import {text} from "../../helpers/text";
import Dropdown from "../Dropdown";
import {createRouteId} from "../../helpers/keys";

@inject(app("Filters"))
@observer
class RouteInput extends Component {
  onChange = (e) => {
    const {Filters, routes} = this.props;
    const selectedValue = get(e, "target.value", false);

    if (!selectedValue) {
      return Filters.setRoute({routeId: "", direction: "", originStopId: ""});
    }

    const route = routes.find((r) => createRouteId(r) === selectedValue);

    if (route) {
      Filters.setRoute(route);
    }
  };

  render() {
    const {
      state: {route},
      routes,
    } = this.props;

    const options = routes.map((routeOption) => {
      const {id, routeId, direction, origin, destination} = routeOption;

      return {
        key: id,
        value: createRouteId(routeOption),
        label: `${routeId} - suunta ${direction}, ${origin} - ${destination}`,
      };
    });

    const hasRoutes = routes.length > 0;
    options.unshift({
      value: "",
      label: hasRoutes ? text("filterpanel.select_route") : text("filterpanel.no_routes"),
    });
    const currentValue = createRouteId(route);

    return (
      <Dropdown
        helpText="Select route"
        disabled={!hasRoutes}
        value={currentValue}
        onChange={this.onChange}>
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
