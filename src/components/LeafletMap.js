import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export class LeafletMap extends Component {
  constructor() {
    super();
    this.state = {lat: 60.170988, lng: 24.940842, zoom: 13};
  }

  render() {
    const {children} = this.props;

    const position = [this.state.lat, this.state.lng];

    return (
      <Map center={position} zoom={this.state.zoom} maxZoom={18} zoomControl={false}>
        <Pane name="hfp" style={{zIndex: 450}} />
        <Pane name="stops" style={{zIndex: 420}} />
        <TileLayer
          attribution={
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
          }
          url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
          tileSize={512}
          zoomOffset={-1}
        />
        <ZoomControl position="topright" />
        {children}
      </Map>
    );
  }
}
