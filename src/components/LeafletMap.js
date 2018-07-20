import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane, Popup, CircleMarker} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RouteLayer from "./RouteLayer";
import HfpLayer from "./HfpLayer";
import HfpMarkerLayer from "./HfpMarkerLayer";

export class LeafletMap extends Component {
  constructor() {
    super();
    this.state = {lat: 60.170988, lng: 24.940842, zoom: 13};
  }

  render() {
    const {
      stop,
      route,
      departureTime,
      hfpPositions,
      hfpPosition,
      routePositions,
      stops,
    } = this.props;

    const {routeId, direction} = route;

    const position = [this.state.lat, this.state.lng];

    const routeLayerKey = `${routeId}_${direction}_${departureTime}_${
      hfpPositions.length
    }`;

    return (
      <Map center={position} zoom={this.state.zoom} maxZoom={18} zoomControl={false}>
        <Pane name="hfp" style={{zIndex: 450}} />
        <TileLayer
          attribution={
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
          }
          url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
          tileSize={512}
          zoomOffset={-1}
        />
        <ZoomControl position="topright" />
        <RouteLayer
          positions={routePositions}
          hfpPositions={hfpPositions}
          stops={stops}
        />
        {hfpPositions.length > 0 && (
          <HfpLayer key={"hfp" + routeLayerKey} positions={hfpPositions} />
        )}
        {hfpPosition && <HfpMarkerLayer position={hfpPosition} />}
        <Pane name="stops" style={{zIndex: 420}} />
        {stop.stopId && (
          <CircleMarker
            pane="stops"
            center={[stop.lat, stop.lon]}
            fillColor="#00ff88"
            fillOpacity={1}
            weight={3}
            radius={8}>
            <Popup>{[stop.nameFi, " ", stop.shortId.replace(/ /g, "")]}</Popup>
          </CircleMarker>
        )}
      </Map>
    );
  }
}
