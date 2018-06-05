import React, {Component} from 'react';
import {Map, TileLayer, ZoomControl} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

export class LeafletMap extends Component {
  constructor() {
    super()
    this.state = {
      lat: 60.20,
      lng: 24.93,
      zoom: 13,
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <Map center={position} zoom={this.state.zoom} maxZoom={18} zoomControl={false}>
        <TileLayer
          attribution={'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '}
          url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
          tileSize={512}
          zoomOffset={-1}
        />
        <ZoomControl position="topright"/>
      </Map>
    )
  }


}