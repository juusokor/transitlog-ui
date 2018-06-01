import {Map, TileLayer} from 'react-leaflet';
import React, { Component } from 'react';

export class LeafletMap extends Component {
  constructor() {
    super()
    this.state = {
      lat: 60.505,
      lng: 24.09,
      zoom: 13,
    }
  }

  // initializeMap() {
  //   this.map = L.map("map-leaflet");
  //   L.tileLayer("https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}{retina}.png", {
  //     maxZoom: 18,
  //     tileSize: 512,
  //     zoomOffset: -1,
  //     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
  //     '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
  //     'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  //     retina: L.retina ? "" : "@2x",
  //     baseLayer: true,
  //   }).addTo(this.map);
  //   addControlButton(this.map, this.props.toggleFullscreen);
  //   addRouteFilterLayer(this.map);
  // }

  render() {
    const position = [this.state.lat, this.state.lng]
    return(
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution="foobar"
          url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
        />
      </Map>
    )
  }


}