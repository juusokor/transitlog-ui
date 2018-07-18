import React, {Component} from "react";
import {Polyline} from "react-leaflet";

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);

  render() {
    return (
      <Polyline
        weight={5}
        positions={this.coords}
      />
    );
  }
}

export default RouteLayer;
