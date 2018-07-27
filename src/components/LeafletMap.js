import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

export class LeafletMap extends Component {
  render() {
    const {children, position, onMapChanged} = this.props;
    const center = [position.lat, position.lng];

    return (
      <Map
        center={center}
        zoom={position.zoom}
        bounds={position.bounds || undefined}
        maxZoom={18}
        zoomControl={false}
        onDragend={onMapChanged}
        onZoomend={onMapChanged}>
        <Pane name="route-lines" style={{zIndex: 410}} />
        <Pane name="hfp-lines" style={{zIndex: 420}} />
        <Pane name="hfp-markers" style={{zIndex: 430}} />
        <Pane name="stops" style={{zIndex: 450}} />
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
