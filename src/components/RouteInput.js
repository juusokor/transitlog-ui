import React, {Component} from "react";

export class RouteInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const options = this.props.routes.map(
      ({direction, nameFi}) => "suunta" + direction + ", " + nameFi
    );
    console.log("routes", options);
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
