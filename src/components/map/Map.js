import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {latLngBounds} from "leaflet";
import {LeafletMap} from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import get from "lodash/get";
import debounce from "lodash/debounce";
import {setUrlValue, getUrlValue} from "../../stores/UrlManager";

@inject(app("Journey"))
@observer
class Map extends Component {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
    bounds: null,
  };

  mapRef = React.createRef();

  state = {
    zoom: 13,
    currentMapillaryViewerLocation: false,
  };

  setMapillaryViewerLocation = (location) => {
    this.setState({
      currentMapillaryViewerLocation: location,
    });
  };

  setMapZoom = (zoom) => {
    this.setState({
      zoom,
    });
  };

  getLeaflet = () => {
    return get(this.mapRef, "current.leafletElement", null);
  };

  componentDidMount() {
    const map = this.getLeaflet();

    if (map) {
      const urlBounds = getUrlValue("mapBounds");

      if (urlBounds) {
        const splitUrlBounds = urlBounds.split(",");

        const bounds = latLngBounds(
          [splitUrlBounds[1], splitUrlBounds[0]],
          [splitUrlBounds[3], splitUrlBounds[2]]
        );

        this.setMapBounds(bounds);
      } else {
        map.setView(
          {
            lat: 60.170988,
            lng: 24.940842,
          },
          this.state.zoom
        );
      }
    }
  }

  componentDidUpdate({center: prevCenter}) {
    const {center} = this.props;

    if (!center) {
      return;
    }

    const propsLat = get(center, "lat", "");
    const propsLng = get(center, "lng", "");

    const prevLat = get(prevCenter, "lat", "");
    const prevLng = get(prevCenter, "lng", "");

    const map = this.getLeaflet();

    if (
      map &&
      propsLat &&
      propsLng &&
      propsLat !== prevLat &&
      propsLng !== prevLng
    ) {
      map.setView({
        lat: propsLat,
        lng: propsLng,
      });
    }
  }

  setMapBounds = (bounds = null) => {
    if (bounds && invoke(bounds, "isValid")) {
      const map = this.getLeaflet();

      if (map) {
        map.fitBounds(bounds);
      }
    }
  };

  onMapChanged = () => {
    const map = this.getLeaflet();
    this.props.onMapChanged(map);

    this.setMapUrlBounds(map.getBounds().toBBoxString());
  };

  setMapUrlBounds = debounce((val) => setUrlValue("mapBounds", val), 500);

  onZoom = (event) => {
    const zoom = event.target.getZoom();
    this.setMapZoom(zoom);
  };

  render() {
    const {zoom, currentMapillaryViewerLocation} = this.state;
    const {children, className, viewBbox} = this.props;

    const child = (props) => (
      <>{typeof children === "function" ? children(props) : children}</>
    );

    return (
      <LeafletMap
        setMapillaryViewerLocation={this.setMapillaryViewerLocation}
        currentMapillaryViewerLocation={currentMapillaryViewerLocation}
        viewBbox={viewBbox}
        mapRef={this.mapRef}
        className={className}
        onMapChanged={this.onMapChanged}
        onZoom={this.onZoom}>
        {child({
          setViewerLocation: this.setMapillaryViewerLocation,
          zoom,
          setMapBounds: this.setMapBounds,
        })}
      </LeafletMap>
    );
  }
}
export default Map;
