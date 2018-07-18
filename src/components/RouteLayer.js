import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);
  stops = this.props.stops;
  render() {
    return [
      <Polyline weight={5} positions={this.coords} />,
      [
        this.stops.map(({stop}) => (
          <CircleMarker center={[stop.lat, stop.lon]} color="#007ac9" radius={10}>
            <Popup> {[stop.nameFi, " ", stop.shortId.replace(/ /g, "")]} </Popup>
          </CircleMarker>
        )),
      ],
    ];
  }
}

export default RouteLayer;
