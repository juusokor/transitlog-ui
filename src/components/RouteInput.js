import React, {Component} from "react";

export class RouteInput extends Component {

  render() {
    const { routes } = this.props
    
    const options = routes.map(
      ({direction, nameFi}) => "suunta" + direction + ", " + nameFi
    );
    
    return (
      <select>
        {options.map((name) => (
          <option key={`route_select_${name}`} value={name}>
            {name}
          </option>
        ))}
      </select>
    );
  }
}
