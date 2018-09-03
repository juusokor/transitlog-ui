import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane, LayersControl} from "react-leaflet";
import {ReactLeafletGoogle} from "../../lib/react-leaflet-google/ReactLeafletGoogle";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import get from "lodash/get";

const googleKey = "AIzaSyCD6EsHkznqImEhDQ4MvFGHya10gJdqqyI";

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
        ref={this.mapRef}
        center={center}
        zoom={zoom}
        bounds={bounds}
        maxZoom={18} /* Google satellite layer doesn't handle more than 18 */
        zoomControl={false}
        onViewportChanged={this.onViewportChange(onMapChanged)}
        onViewportChange={this.onViewportChange(onMapChange)}>
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Digitransit" checked={true}>
            <TileLayer
              attribution={
                'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
              }
              url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
              tileSize={512}
              zoomOffset={-1}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Hybrid">
            <ReactLeafletGoogle
              googlekey={googleKey}
              maptype="HYBRID"
              libraries={["geometry", "places"]}
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
