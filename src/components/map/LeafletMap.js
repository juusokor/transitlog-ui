import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane, LayersControl} from "react-leaflet";
import {latLng} from "leaflet";
import MapillaryViewer from "./MapillaryViewer";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";
import MapillaryGeoJSONLayer from "./MapillaryGeoJSONLayer";

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed;
  display: flex;
  flex-direction: column;

  > .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 0;
    flex: 1 1 50%;
  }
`;

const MapillaryView = styled(MapillaryViewer)`
  width: 100%;
  height: 100%;
  flex: 1 1 50%;
  position: relative;
`;

export class LeafletMap extends Component {
  state = {
    currentBaseLayer: "Digitransit",
    currentOverlays: [],
    currentMapillaryViewerLocation: false,
    currentMapillaryMapLocation: false,
  };

  onChangeBaseLayer = ({name}) => {
    this.setState({
      currentBaseLayer: name,
    });
  };

  onChangeOverlay = (action) => ({name}) => {
    const overlays = this.state.currentOverlays;

    if (action === "remove") {
      const idx = overlays.indexOf(name);

      if (idx !== -1) {
        overlays.splice(idx, 1);
      }
    } else if (action === "add") {
      overlays.push(name);
    }

    this.setState({
      currentOverlays: overlays,
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
      mapRef,
      children,
      className,
      viewBbox,
      onZoom = () => {},
      onMapChanged = () => {},
    } = this.props;

    const {
      currentBaseLayer,
      currentMapillaryViewerLocation,
      currentMapillaryMapLocation,
      currentOverlays,
    } = this.state;

    return (
      <MapContainer className={className}>
        <Map
          key="the-map"
          ref={mapRef}
          maxZoom={20}
          selectArea={true}
          zoomControl={false}
          onBaselayerchange={this.onChangeBaseLayer}
          onOverlayadd={this.onChangeOverlay("add")}
          onOverlayremove={this.onChangeOverlay("remove")}
          onZoomend={onZoom}
          onMoveend={onMapChanged}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer
              name="Digitransit"
              checked={currentBaseLayer === "Digitransit"}>
              <TileLayer
                attribution={
                  'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
                }
                url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
                tileSize={512}
                zoomOffset={-1}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer
              name="Aerial"
              checked={currentBaseLayer === "Aerial"}>
              <TileLayer
                attribution="MML/LUKE"
                url="http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg"
              />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay
              name="Mapillary"
              checked={currentOverlays.indexOf("Mapillary") !== -1}>
              <MapillaryGeoJSONLayer
                viewBbox={viewBbox}
                location={currentMapillaryMapLocation}
                layerIsActive={currentOverlays.indexOf("Mapillary") !== -1}
                onSelectLocation={this.setMapillaryViewerLocation}
              />
            </LayersControl.Overlay>
          </LayersControl>
          <Pane name="route-lines" style={{zIndex: 410}} />
          <Pane name="hfp-lines" style={{zIndex: 420}} />
          <Pane name="hfp-markers" style={{zIndex: 430}} />
          <Pane name="stops" style={{zIndex: 450}} />
          <ZoomControl position="topright" />
          {children}
        </Map>
        {currentOverlays.indexOf("Mapillary") !== -1 &&
          currentMapillaryViewerLocation && (
            <MapillaryView
              elementId="mapillary-viewer"
              onNavigation={this.onMapillaryNavigation}
              location={currentMapillaryViewerLocation}
            />
          )}
      </MapContainer>
    );
  }
}
