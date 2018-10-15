import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {LeafletMap} from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import get from "lodash/get";
import {latLng} from "leaflet";

@inject(app("Journey"))
@observer
class Map extends Component {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
    bounds: null,
  };

  static getDerivedStateFromProps({center}, {lat, lng}) {
    const propsLat = get(center, "lat", "");
    const propsLng = get(center, "lng", "");

    if (propsLat && propsLng && propsLat !== lat && propsLng !== lng) {
      return {
        lat: propsLat,
        lng: propsLng,
      };
    }

    return null;
  }

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
    const {bounds: propBounds, children, className} = this.props;
    const {lat, lng, zoom, bounds} = this.state;

    const useBounds = propBounds || bounds || null;
    const useCenter = [lat, lng] || null;

    return (
      <LeafletMap
        className={className}
        center={useCenter}
        zoom={zoom}
        bounds={useBounds}
        onMapChanged={this.onMapChanged}
        onMapChange={this.onMapChange}>
        {typeof children === "function"
          ? children({lat, lng, zoom, setMapBounds: this.setMapBounds})
          : children}
      </LeafletMap>
    );
  }
}

export default Map;
