import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane} from "react-leaflet";
import "leaflet/dist/leaflet.css";

export class LeafletMap extends Component {
  render() {
    const {children, position, onMapChanged} = this.props;
    const center = [position.lat, position.lng];

    return (
      <Map
        center={center}
        zoom={position.zoom}
        maxZoom={18}
        zoomControl={false}
        onDragend={onMapChanged}
        onZoomend={onMapChanged}>
        <Pane name="hfp-lines" style={{zIndex: 440}} />
        <Pane name="hfp-markers" style={{zIndex: 450}} />
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
