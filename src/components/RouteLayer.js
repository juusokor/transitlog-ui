import React, {Component} from "react";
import {Polyline, Circle} from "react-leaflet";

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);
  teststop = this.props.stops[5].stop
  stops = this.props.stops
  render() {
    console.log('STOPP', this.teststop)
    return (
      [<Polyline weight={5} positions={this.coords} />,
      [this.stops.map(({stop}) => (
         <Circle center={[stop.lat, stop.lon]} color="red" radius={20} />))],
      <Circle center={[this.teststop.lat, this.teststop.lon]} color="red" radius={20} />]
    );
  }
}

export default RouteLayer;
