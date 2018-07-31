import React, {Component} from "react";
import createRouteIdentifier from "../../helpers/createRouteIdentifier";

export class RouteInput extends Component {
  onChange = (e) => {
    const {routes, onRouteSelected} = this.props;
    const selectedValue = e.target.value;

    if (!selectedValue) {
      return onRouteSelected(null);
    }

    const route = routes.find(
      (route) => createRouteIdentifier(route) === selectedValue
    );

    onRouteSelected(route);
  };

  render() {
    const {route, routes} = this.props;

    const options = routes.map(
      ({routeId, direction, nameFi, dateBegin, dateEnd}) => ({
        value: createRouteIdentifier({routeId, direction, dateBegin}),
        label: `${routeId} - suunta ${direction}, ${nameFi}. ${dateBegin} - ${dateEnd}`,
      })
    );

    options.unshift({value: "", label: "Valitse reitti..."});

    return (
      <select value={createRouteIdentifier(route)} onChange={this.onChange}>
        {options.map(({value, label}) => (
          <option key={`route_select_${value}`} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }
}
