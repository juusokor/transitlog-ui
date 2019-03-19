import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {get} from "lodash";
import {text} from "../../helpers/text";
import Dropdown from "../Dropdown";
import {createRouteKey} from "../../helpers/keys";
import withRoute from "../../hoc/withRoute";

@inject(app("Filters"))
@withRoute()
@observer
class RouteInput extends Component {
  onChange = (e) => {
    const {Filters, routes} = this.props;
    const selectedValue = get(e, "target.value", false);

    if (!selectedValue) {
      return Filters.setRoute({routeId: "", direction: "", id: "", originStopId: ""});
    }

    const route = routes.find((r) => createRouteKey(r) === selectedValue);

    console.log(route);

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
        value: id,
        label: `${routeId} - suunta ${direction}, ${origin} - ${destination}`,
      };
    });

    options.unshift({value: "", label: text("filterpanel.select_route")});
    const currentValue = route.id;

    return (
      <Dropdown helpText="Select route" value={currentValue} onChange={this.onChange}>
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
