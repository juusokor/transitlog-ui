import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane, Popup, CircleMarker} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RouteLayer from "./RouteLayer";
import HfpLayer from "./HfpLayer";

export class LeafletMap extends Component {
  constructor() {
    super();
    this.state = {lat: 60.170988, lng: 24.940842, zoom: 13};
  }

  map = React.createRef();

  render() {
    const {
      stop,
      route,
      departureTime,
      hfpPositions,
      routePositions,
      stops,
    } = this.props;
    const {routeId, direction} = route;

    const position = [this.state.lat, this.state.lng];

    const routeLayerKey = `${routeId}_${direction}_${departureTime}_${
      hfpPositions.length
    }`;

    return (
      <Map
        center={position}
        ref={this.map}
        zoom={this.state.zoom}
        maxZoom={18}
        zoomControl={false}>
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
          key={"route" + routeLayerKey}
          positions={routePositions}
          hfpPositions={hfpPositions}
          stops={stops}
        />
        {hfpPositions.length > 0 && (
          <HfpLayer key={"hfp" + routeLayerKey} positions={hfpPositions} />
        )}
        <Pane name="stops" style={{zIndex: 420}} />
        {stop.stopId && (
          <CircleMarker
            pane="stops"
            center={[stop.lat, stop.lon]}
            fill={true}
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
