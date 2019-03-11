import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import LeafletMap from "./LeafletMap";
import {app} from "mobx-app";
import trim from "lodash/trim";
import get from "lodash/get";
import debounce from "lodash/debounce";
import {setUrlValue, getUrlValue} from "../../stores/UrlManager";
import {reaction, observable, action} from "mobx";
import {LatLngBounds} from "leaflet";
import {runInAction} from "mobx";

const MAP_BOUNDS_URL_KEY = "mapView";

/**
 * This component contains app-specific logic and functions. It wraps LeafletMap,
 * which contains leaflet-specific setup and components.
 */

@inject(app("Journey"))
@observer
class Map extends Component {
  static defaultProps = {
    onViewChanged: () => {},
  };

  canSetView = false;
  prevCenter = null;

  disposeSidePanelReaction = () => {};

  mapRef = React.createRef();

  @observable
  zoom = 13;

  @observable.ref
  mapView = null;

  @observable
  currentMapillaryViewerLocation = false;

  setMapillaryViewerLocation = action((location) => {
    this.currentMapillaryViewerLocation = location;
  });

  setMapZoom = action((zoom) => {
    this.zoom = zoom;
  });

  getLeaflet = () => {
    return get(this.mapRef, "current.leafletElement", null);
  };

  componentDidMount() {
    const {state} = this.props;
    const map = this.getLeaflet();

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
      {delay: 500}
    );

    let urlCenter = "";

    if (map) {
      urlCenter = getUrlValue(MAP_BOUNDS_URL_KEY);
      let [lat = "", lng = "", zoom = this.zoom] = urlCenter.split(",");

      if (!lat || !trim(lat) || !parseInt(lat)) {
        lat = 60.170988;
      }
      if (!lng || !trim(lng) || !parseInt(lng)) {
        lng = 24.940842;
      }

      map.setView({lat, lng}, zoom);
    }

    // To prevent the map from moving away from the view shared in the URL, allow
    // view changes only after a timeout. Feel free to adjust if this value doesn't work.
    setTimeout(() => (this.canSetView = true), urlCenter ? 3000 : 0);
  }

  setMapView = (center) => {
    const map = this.getLeaflet();

    if (!this.canSetView || !center || !map) {
      return;
    }

    const prevCenter = this.prevCenter;

    if (prevCenter && !center.equals(prevCenter)) {
      this.prevCenter = center;

      if (center instanceof LatLngBounds) {
        map.fitBounds(center);
      } else {
        map.setView(center);
      }
    }

    if (!prevCenter) {
      this.prevCenter = center;
    }
  };

  componentWillUnmount() {
    this.disposeSidePanelReaction();
  }

  setMapUrlState = debounce(
    (center, zoom) =>
      center.lat &&
      center.lng &&
      zoom &&
      setUrlValue(MAP_BOUNDS_URL_KEY, `${center.lat},${center.lng},${zoom}`),
    500
  );

  onMapChanged = () => {
    const map = this.getLeaflet();
    this.setMapUrlState(map.getCenter(), map.getZoom());
    this.setMapViewState(map);
  };

  setMapViewState = (map) => {
    if (!map) {
      return;
    }

    const bounds = map.getBounds();
    const {mapView} = this;

    if (mapView && bounds.equals(mapView)) {
      return;
    }

    setTimeout(() => {
      runInAction(() => (this.mapView = bounds));
    }, 1);
  };

  onZoom = (event) => {
    const zoom = event.target.getZoom();
    this.setMapZoom(zoom);
  };

  getMapView = () => this.mapView;

  render() {
    const {children, className} = this.props;

    return (
      <LeafletMap
        setMapillaryViewerLocation={this.setMapillaryViewerLocation}
        currentMapillaryViewerLocation={this.currentMapillaryViewerLocation}
        mapRef={this.mapRef}
        className={className}
        onMapChanged={this.onMapChanged}
        onZoom={this.onZoom}>
        {children({
          setViewerLocation: this.setMapillaryViewerLocation,
          zoom: this.zoom,
          getMapView: this.getMapView,
          setMapView: this.setMapView,
        })}
      </LeafletMap>
    );
  }
}
export default Map;
