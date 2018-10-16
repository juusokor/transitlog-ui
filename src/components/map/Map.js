import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {LeafletMap} from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import get from "lodash/get";

@inject(app("Journey"))
@observer
class Map extends Component {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
  };

  static getDerivedStateFromProps({center}, {lat, lng, zoom}) {
    const propsLat = get(center, "lat", "");
    const propsLng = get(center, "lng", "");

    if (propsLat && propsLng && propsLat !== lat && propsLng !== lng) {
      return {
        lat: propsLat,
        lng: propsLng,
        zoom,
      };
    }

    return null;
  }

  state = {
    lat: 60.170988,
    lng: 24.940842,
    zoom: 13,
  };

  setMapBounds = (bounds = null) => {
    if (bounds && invoke(bounds, "isValid")) {
      const center = bounds.getCenter();

      this.setState({
        lat: center.lat,
        lng: center.lng,
      });
    }
  };

  onMapChanged = (map, viewport) => {
    this.props.onMapChanged(map, viewport);
  };

  onMapChange = (viewport) => {
    this.setState({
      lat: viewport.center[0],
      lng: viewport.center[1],
      zoom: viewport.zoom,
    });
  };

  render() {
    const {children, className} = this.props;
    const {lat, lng, zoom} = this.state;

    return (
      <LeafletMap
        className={className}
        center={[lat, lng]}
        zoom={zoom}
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
