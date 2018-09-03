import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane, LayersControl} from "react-leaflet";
import * as L from "leaflet";
import "proj4leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import get from "lodash/get";

const crs = new L.Proj.CRS(
  "EPSG:3879",
  "+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  {
    resolutions: [8192, 4096, 2048, 1024, 512, 256],
    origin: [24747856.43, 6562789.7],
    bounds: L.bounds(L.point(-16.1, 32.88), L.point(40.18, 84.17)),
  }
);

export class LeafletMap extends Component {
  mapRef = React.createRef();

  onViewportChange = (cb = () => {}) => (viewport) => {
    cb(get(this.mapRef, "current.leafletElement", null), viewport);
  };

  render() {
    const {
      children,
      center,
      zoom,
      bounds,
      onMapChange = () => {},
      onMapChanged = () => {},
    } = this.props;

    return (
      <Map
        crs={crs}
        ref={this.mapRef}
        center={center}
        zoom={zoom}
        bounds={bounds}
        maxZoom={20}
        zoomControl={false}
        onViewportChanged={this.onViewportChange(onMapChanged)}
        onViewportChange={this.onViewportChange(onMapChange)}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Digitransit">
            <TileLayer
              attribution={
                'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
              }
              url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
              tileSize={512}
              zoomOffset={-1}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Aerial map" checked={true}>
            <TileLayer
              attribution="LIJ/HSY"
              tms={true}
              tileSize={256}
              url="https://partner-info.lij.hsl.fi/geoserver/gwc/service/tms/1.0.0/hsl:HSL_GK25_2500m_converted@EPSG:3879-HSL@jpeg/{z}/{x}/{y}.jpg"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <Pane name="route-lines" style={{zIndex: 410}} />
        <Pane name="hfp-lines" style={{zIndex: 420}} />
        <Pane name="hfp-markers" style={{zIndex: 430}} />
        <Pane name="stops" style={{zIndex: 450}} />
        <ZoomControl position="topright" />
        {children}
      </Map>
    );
  }
}
