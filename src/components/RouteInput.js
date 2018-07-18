import React, {Component} from "react";

export class RouteInput extends Component {
  onChange = (e) => {
    const {routes, onRouteSelected} = this.props;
    const selectedValue = e.target.value;

    if (!selectedValue) {
      return onRouteSelected(null);
    }

    const route = routes.find(
      (r) => this.createRouteIdentifier(r.routeId, r.direction) === selectedValue
    );

    onRouteSelected(route);
  };

  createRouteIdentifier = (routeId, direction) => `${routeId}_${direction}`;

  render() {
    const {route, routes} = this.props;

    const options = routes.map(({routeId, direction, nameFi}) => ({
      value: this.createRouteIdentifier(routeId, direction),
      label: `${routeId} - suunta ${direction}, ${nameFi}`,
    }));

    options.unshift({value: "", label: "Valitse reitti..."});

    return (
      <select
        value={this.createRouteIdentifier(route.routeId, route.direction)}
        onChange={this.onChange}>
        {options.map(({value, label}) => (
          <option key={`route_select_${value}`} value={value}>
            {label}
          </option>
        ))}
      </select>
    );
  }
}
