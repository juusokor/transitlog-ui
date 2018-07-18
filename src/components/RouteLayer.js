import React, {Component} from "react";
import {Polyline, Circle} from "react-leaflet";

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);

  render() {
    return (
      <Polyline weight={5} positions={this.coords} />,
      <Circle center={[60.17, 24.92]} color="red" radius={20} />
    );
  }
}

export default RouteLayer;
