import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {LeafletMap} from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import get from "lodash/get";
import {observable, action} from "mobx";

@inject(app("Journey"))
@observer
class Map extends Component {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
    bounds: null,
  };

  @observable
  mapState = {
    bounds: null,
    lat: 60.170988,
    lng: 24.940842,
    zoom: 13,
  };

  setMapState = action("Set map position", (lat, lng, zoom) => {
    this.mapState.lat = lat;
    this.mapState.lng = lng;

    if (zoom) {
      this.mapState.zoom = zoom;
    }
  });

  componentDidUpdate({center: prevCenter}) {
    const {center} = this.props;

    const propsLat = get(center, "lat", "");
    const propsLng = get(center, "lng", "");

    const prevLat = get(prevCenter, "lat", "");
    const prevLng = get(prevCenter, "lng", "");

    if (propsLat && propsLng && propsLat !== prevLat && propsLng !== prevLng) {
      this.setMapState(propsLat, propsLng);
    }
  }

  setMapBounds = action("Set map bounds", (bounds = null) => {
    if (bounds && invoke(bounds, "isValid")) {
      this.mapState.bounds = bounds;
    }
  });

  onMapChanged = (map, viewport) => {
    this.props.onMapChanged(map, viewport);
  };

  onMapChange = (viewport) => {
    this.setMapState(viewport.center[0], viewport.center[1], viewport.zoom);
  };

  render() {
    const {children, className} = this.props;
    const {lat, lng, zoom, bounds} = this.mapState;

    const child = (props) => (
      <>{typeof children === "function" ? children(props) : children}</>
    );

    return (
      <LeafletMap
        className={className}
        center={[lat, lng]}
        zoom={zoom}
        bounds={bounds}
        onMapChanged={this.onMapChanged}
        onMapChange={this.onMapChange}>
        {child({
          lat,
          lng,
          zoom,
          setMapBounds: this.setMapBounds,
        })}
      </LeafletMap>
    );
  }
}

export default Map;
