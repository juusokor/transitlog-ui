import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane, LayersControl} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import get from "lodash/get";
import {latLng} from "leaflet";
import MapillaryViewer from "./MapillaryViewer";
import MapillaryLayer from "./MapillaryLayer";

export class LeafletMap extends Component {
  mapRef = React.createRef();

  state = {
    currentBaseLayer: this.props.defaultLayer,
    currentMapillaryViewerLocation: false,
    currentMapillaryMapLocation: false,
  };

  onViewportChange = (cb = () => {}) => (viewport) => {
    cb(get(this.mapRef, "current.leafletElement", null), viewport);
  };

  onChangeBaseLayer = ({name}) => {
    this.setState({
      currentBaseLayer: name,
    });
  };

  setMapillaryViewerLocation = (location) => {
    this.setState({
      currentMapillaryViewerLocation: location,
    });
  };

  onMapillaryNavigation = ({latLon: {lat, lon}}) => {
    const location = latLng({lat, lng: lon});

    this.setState({
      currentMapillaryMapLocation: location,
    });
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

    const {
      currentBaseLayer,
      currentMapillaryViewerLocation,
      currentMapillaryMapLocation,
    } = this.state;

    return (
      <div className="map-container">
        <Map
          ref={this.mapRef}
          center={center}
          zoom={zoom}
          bounds={bounds}
          maxZoom={20}
          zoomControl={false}
          onBaselayerchange={this.onChangeBaseLayer}
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
            <LayersControl.BaseLayer name="Aerial">
              <TileLayer
                attribution="MML/LUKE"
                url="http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer
              name="Mapillary"
              checked={currentBaseLayer === "Mapillary"}>
              <MapillaryLayer
                location={currentMapillaryMapLocation}
                layerIsActive={currentBaseLayer === "Mapillary"}
                onSelectLocation={this.setMapillaryViewerLocation}
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
        {currentBaseLayer === "Mapillary" &&
          currentMapillaryViewerLocation && (
            <MapillaryViewer
              className="mapillary-viewer"
              onNavigation={this.onMapillaryNavigation}
              location={currentMapillaryViewerLocation}
            />
          )}
      </div>
    );
  }
}
