import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {LeafletMap} from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";

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
    const {bounds: propBounds, children} = this.props;
    const {lat, lng, zoom, bounds} = this.state;

    const useBounds = propBounds || bounds || null;

    return (
      <LeafletMap
        center={[lat, lng]}
        zoom={zoom}
        bounds={useBounds}
        onMapChanged={this.onMapChanged}
        onMapChange={this.onMapChange}>
        {children}
      </LeafletMap>
    );
  }
}

export default Map;
