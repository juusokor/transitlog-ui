import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane, LayersControl} from "react-leaflet";
import get from "lodash/get";
import {latLng} from "leaflet";
import MapillaryViewer from "./MapillaryViewer";
import MapillaryLayer from "./MapillaryLayer";
import styled from "styled-components";
import "leaflet/dist/leaflet.css";

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
    currentMapillaryViewerLocation: false,
    currentMapillaryMapLocation: false,
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
      mapRef,
      children,
      className,
      onZoom = () => {},
      onMapChanged = () => {},
    } = this.props;

    const {
      currentBaseLayer,
      currentMapillaryViewerLocation,
      currentMapillaryMapLocation,
    } = this.state;

    return (
      <MapContainer className={className}>
        <Map
          key="the-map"
          ref={mapRef}
          maxZoom={20}
          zoomControl={false}
          onBaselayerchange={this.onChangeBaseLayer}
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
            {/*<LayersControl.BaseLayer
              name="Mapillary"
              checked={currentBaseLayer === "Mapillary"}>
              <MapillaryLayer
                location={currentMapillaryMapLocation}
                layerIsActive={currentBaseLayer === "Mapillary"}
                onSelectLocation={this.setMapillaryViewerLocation}
              />
            </LayersControl.BaseLayer>*/}
          </LayersControl>
          <Pane name="route-lines" style={{zIndex: 410}} />
          <Pane name="hfp-lines" style={{zIndex: 420}} />
          <Pane name="hfp-markers" style={{zIndex: 430}} />
          <Pane name="stops" style={{zIndex: 450}} />
          <ZoomControl position="topright" />
          {children}
        </Map>
        {/* Temporarily disable mapillary */}
        {/*{currentBaseLayer === "Mapillary" &&
          currentMapillaryViewerLocation && (
            <MapillaryView
              onNavigation={this.onMapillaryNavigation}
              location={currentMapillaryViewerLocation}
            />
          )}*/}
      </MapContainer>
    );
  }
}
