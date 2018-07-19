import React, {Component} from "react";

export class RouteInput extends Component {
  onChange = (e) => {
    const {routes, onRouteSelected} = this.props;
    const selectedValue = e.target.value;

    if (!selectedValue) {
      return onRouteSelected(null);
    }

    const route = routes.find(
      (r) =>
        this.createRouteIdentifier(r.routeId, r.direction, r.dateBegin) ===
        selectedValue
    );

    onRouteSelected(route);
  };

  createRouteIdentifier = (routeId, direction, dateBegin) =>
    `${routeId}_${direction}_${dateBegin}`;

  render() {
    const {route, routes} = this.props;

    const options = routes.map(({routeId, direction, nameFi, dateBegin}) => ({
      value: this.createRouteIdentifier(routeId, direction, dateBegin),
      label: `${routeId} - suunta ${direction}, ${nameFi}`,
    }));

    options.unshift({value: "", label: "Choose route..."});

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
