import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import LeafletMap from "./LeafletMap";
import {app} from "mobx-app";
import invoke from "lodash/invoke";
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

  didSetUrlPosition = !getUrlValue(MAP_BOUNDS_URL_KEY);

  disposeSidePanelReaction = () => {};
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

    this.disposeSidePanelReaction = reaction(
      () =>
        (this.props.state.sidePanelVisible ? "visible" : "not visible") +
        (this.props.state.journeyDetailsOpen ? " details open" : " details closed"),
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

      const [
        lat = 60.170988,
        lng = 24.940842,
        zoom = this.state.zoom,
      ] = urlCenter.split(",");

      map.setView(
        {
          lat,
          lng,
        },
        zoom
      );

      setTimeout(() => {
        this.didSetUrlPosition = true;
      }, 1000);
    }
  }

  componentDidUpdate({center: prevCenter}) {
    const {center} = this.props;

    if (!this.didSetUrlPosition || !center) {
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
  }

  setMapBounds = (bounds = null) => {
    if (this.didSetUrlPosition && bounds && invoke(bounds, "isValid")) {
      const map = this.getLeaflet();

      if (map) {
        map.fitBounds(bounds);
      }
    }
  };

  onMapChanged = () => {
    const map = this.getLeaflet();
    this.props.onMapChanged(map);
    this.setMapUrlState(map.getCenter(), map.getZoom());
  };

  setMapUrlState = debounce(
    (center, zoom) =>
      setUrlValue(MAP_BOUNDS_URL_KEY, `${center.lat},${center.lng},${zoom}`),
    500
  );

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
