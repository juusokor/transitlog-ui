import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import LeafletMap from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
import trim from "lodash/trim";
import get from "lodash/get";
import debounce from "lodash/debounce";
import {setUrlValue, getUrlValue} from "../../stores/UrlManager";
import {reaction} from "mobx";

const MAP_BOUNDS_URL_KEY = "mapView";

/**
 * This component contains app-specific logic and functions. It wraps LeafletMap,
 * which contains leaflet-specific setup and components.
 */

@inject(app("Journey"))
@observer
class Map extends Component {
  static defaultProps = {
    onMapChanged: () => {},
    onMapChange: () => {},
    bounds: null,
  };

  canSetView = false;

  disposeSidePanelReaction = () => {};
  disposeCanSetViewReaction = () => {};

  mapRef = React.createRef();

  state = {
    zoom: 13,
    mapView: null,
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
    const {state} = this.props;
    const map = this.getLeaflet();

    this.disposeCanSetViewReaction = reaction(
      () => (!this.canSetView ? [state.time, state.route] : false),
      (change) => change !== false && (this.canSetView = true)
    );

    this.disposeSidePanelReaction = reaction(
      () =>
        (state.sidePanelVisible ? "visible" : "not visible") +
        (state.journeyDetailsAreOpen ? " details open" : " details closed"),
      () => {
        const leafletMap = this.getLeaflet();

        if (leafletMap) {
          leafletMap.invalidateSize(true);
        }
      },
      {
        delay: 500,
      }
    );

    if (map) {
      const urlCenter = getUrlValue(MAP_BOUNDS_URL_KEY);

      let [lat = "", lng = "", zoom = this.state.zoom] = urlCenter.split(",");

      if (!lat || !trim(lat) || !parseInt(lat)) {
        lat = 60.170988;
      }

      if (!lng || !trim(lng) || !parseInt(lng)) {
        lng = 24.940842;
      }

      map.setView(
        {
          lat,
          lng,
        },
        zoom
      );
    }
  }

  componentDidUpdate({center: prevCenter}) {
    const {center} = this.props;

    if (!this.canSetView || !center) {
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

  componentWillUnmount() {
    this.disposeSidePanelReaction();
    this.disposeCanSetViewReaction();
  }

  setMapBounds = (bounds = null) => {
    if (this.canSetView && bounds && invoke(bounds, "isValid")) {
      const map = this.getLeaflet();

      if (map) {
        map.fitBounds(bounds);
      }
    }
  };

  setMapView = (map) => {
    if (!map) {
      return;
    }

    const {route} = this.props.state;

    if (route && route.routeId) {
      return;
    }

    this.setState((state) => {
      const bounds = map.getBounds();
      const {mapView} = state;

      if (
        !bounds ||
        !invoke(bounds, "isValid") ||
        (mapView && bounds.equals(mapView))
      ) {
        return state;
      }

      return {
        mapView: bounds,
      };
    });
  };

  onMapChanged = () => {
    const map = this.getLeaflet();
    this.setMapView(map);
    this.setMapUrlState(map.getCenter(), map.getZoom());
  };

  setMapUrlState = debounce(
    (center, zoom) =>
      center.lat &&
      center.lng &&
      zoom &&
      setUrlValue(MAP_BOUNDS_URL_KEY, `${center.lat},${center.lng},${zoom}`),
    500
  );

  onZoom = (event) => {
    const zoom = event.target.getZoom();
    this.setMapZoom(zoom);
  };

  render() {
    const {zoom, currentMapillaryViewerLocation, mapView} = this.state;
    const {children, className} = this.props;

    const child = (props) => (
      <>{typeof children === "function" ? children(props) : children}</>
    );

    return (
      <LeafletMap
        setMapillaryViewerLocation={this.setMapillaryViewerLocation}
        currentMapillaryViewerLocation={currentMapillaryViewerLocation}
        mapRef={this.mapRef}
        mapView={mapView}
        className={className}
        onMapChanged={this.onMapChanged}
        onZoom={this.onZoom}>
        {child({
          setViewerLocation: this.setMapillaryViewerLocation,
          zoom,
          mapView,
          setMapBounds: this.setMapBounds,
        })}
      </LeafletMap>
    );
  }
}
export default Map;
