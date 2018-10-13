import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {LeafletMap} from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import styled from "styled-components";

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: fixed;

  > .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 0;
    flex: 1 1 50%;
  }
`;

@inject(app("Journey"))
@observer
class Map extends Component {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
    bounds: null,
  };

  state = {
    bounds: null,
    lat: 60.170988,
    lng: 24.940842,
    zoom: 13,
  };

  setMapBounds = (bounds = null) => {
    if (bounds && invoke(bounds, "isValid")) {
      this.setState({bounds});
    }
  };

  onMapChanged = (map, viewport) => {
    this.props.onMapChanged(map, viewport);
  };

  onMapChange = (map, viewport) => {
    this.setState({
      lat: viewport.center[0],
      lng: viewport.center[1],
      zoom: viewport.zoom,
    });

    this.props.onMapChange(map, viewport);
  };

  render() {
    const {bounds: propBounds, children, center, className} = this.props;
    const {lat, lng, zoom, bounds} = this.state;

    const useBounds = propBounds || bounds || null;
    const useCenter = center || [lat, lng] || null;

    return (
      <MapContainer className={className}>
        <LeafletMap
          center={useCenter}
          zoom={zoom}
          bounds={useBounds}
          onMapChanged={this.onMapChanged}
          onMapChange={this.onMapChange}>
          {typeof children === "function"
            ? children({lat, lng, zoom, setMapBounds: this.setMapBounds})
            : children}
        </LeafletMap>
      </MapContainer>
    );
  }
}

export default Map;
