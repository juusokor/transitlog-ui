import React from "react";
import {GeoJSON, FeatureGroup, withLeaflet} from "react-leaflet";
import {circleMarker} from "leaflet";
import get from "lodash/get";
import {
  closestPointCompareReducer,
  closestPointInGeometry,
} from "../../helpers/closestPoint";

@withLeaflet
class MapillaryGeoJSONLayer extends React.Component {
  static defaultProps = {
    viewBbox: null,
  };

  highlightedLocation = false;
  marker = null;
  eventsEnabled = false;

  state = {
    features: null,
  };

  onHover = (e) => {
    const {layerIsActive} = this.props;
    const {latlng} = e;

    if (!this.state.features || !layerIsActive) {
      return;
    }

    let featurePoint = closestPointCompareReducer(
      get(this, "state.features.features", []),
      (feature) => closestPointInGeometry(latlng, feature.geometry, 200),
      latlng
    );

    this.highlightedLocation = featurePoint;

    featurePoint =
      featurePoint && !featurePoint.equals(latlng) ? featurePoint : false;
    this.highlightMapillaryPoint(featurePoint);
  };

  createMarker = (position) => {
    return circleMarker(position, {radius: 4, color: "#ff0000"});
  };

  highlightMapillaryPoint = (position) => {
    const {
      leaflet: {map},
    } = this.props;

    if (position) {
      const marker = this.marker || this.createMarker(position);

      if (!this.marker) {
        this.marker = marker;
        this.marker.addTo(map);
      } else {
        this.marker.setLatLng(position);
      }
    } else if (!position && this.marker !== null) {
      this.marker.remove();
      this.marker = null;
    }
  };

  onMapClick = () => {
    const {onSelectLocation} = this.props;

    if (this.highlightedLocation) {
      onSelectLocation(this.highlightedLocation);
    }
  };

  componentDidMount() {
    const {layerIsActive, viewBbox} = this.props;

    if (layerIsActive) {
      this.bindEvents();
      this.fetchFeatures(viewBbox);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {location, layerIsActive, viewBbox} = this.props;
    const {location: prevLocation} = prevProps;

    if (!layerIsActive) {
      this.unbindEvents();
      return;
    } else {
      this.bindEvents();
    }

    if (location && prevLocation && !location.equals(prevLocation)) {
      this.highlightMapillaryPoint(location);
    }

    if (!this.state.features && viewBbox) {
      this.fetchFeatures(viewBbox);
    }
  }

  fetchFeatures = async (bounds) => {
    if (!bounds || !bounds.isValid()) {
      return;
    }

    const round = (coord) => Math.floor(coord * 1000 + 0.5) / 1000;

    const west = round(bounds.getWest());
    const east = round(bounds.getEast());
    const north = round(bounds.getNorth());
    const south = round(bounds.getSouth());

    const url = `https://a.mapillary.com/v3/sequences?bbox=${west},${south},${east},${north}&client_id=V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw`;
    const request = await fetch(url);
    const data = await request.json();

    this.setState({
      features: data,
    });
  };

  bindEvents = () => {
    if (this.eventsEnabled) {
      return;
    }

    const {
      leaflet: {map},
    } = this.props;

    map.on("mousemove", this.onHover);
    map.on("click", this.onMapClick);
    this.eventsEnabled = true;
  };

  unbindEvents = () => {
    if (!this.eventsEnabled) {
      return;
    }

    const {
      leaflet: {map},
    } = this.props;

    map.off("mousemove", this.onHover);
    map.off("click", this.onMapClick);
    this.eventsEnabled = false;
  };

  componentWillUnmount() {
    this.unbindEvents();
  }

  render() {
    const {layerIsActive} = this.props;

    return (
      <FeatureGroup>
        {layerIsActive && this.state.features && (
          <GeoJSON
            style={() => ({
              color: "rgb(50, 200, 200)",
              weight: 3,
              opacity: 0.75,
            })}
            data={this.state.features}
          />
        )}
      </FeatureGroup>
    );
  }
}

export default MapillaryGeoJSONLayer;
