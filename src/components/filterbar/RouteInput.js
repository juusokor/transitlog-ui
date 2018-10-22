import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {get} from "lodash";
import {text} from "../../helpers/text";
import Dropdown from "../Dropdown";
import {createRouteKey} from "../../helpers/hfpCache";
import withRoute from "../../hoc/withRoute";

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

    const route = routes.find((r) => createRouteKey(r) === selectedValue);

    if (route) {
      Filters.setRoute(route);
    }
  };

  render() {
    const {route = null, routes} = this.props;

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
        value: createRouteKey(routeOption),
        label: `${routeId} - suunta ${direction}, ${originFi} - ${destinationFi} (${dateBegin} - ${dateEnd})`,
      };
    });

    options.unshift({value: "", label: text("filterpanel.select_route")});
    const currentValue = createRouteKey(route);

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
