import React from "react";
import Fetch from "../../helpers/Fetch";
import {GeoJSON, FeatureGroup, withLeaflet} from "react-leaflet";
import {circleMarker} from "leaflet";
import get from "lodash/get";
import {
  closestPointCompareReducer,
  closestPointInGeometry,
} from "../../helpers/closestPoint";

@withLeaflet
class MapillaryGeoJSONLayer extends React.Component {
  highlightedLocation = false;
  marker = null;
  features = null;

  onHover = (e) => {
    console.log("hovering");

    const {layerIsActive} = this.props;
    const {latlng} = e;

    if (!this.features || !layerIsActive) {
      return;
    }

    let featurePoint = closestPointCompareReducer(
      get(this, "features.features", []),
      (feature) => closestPointInGeometry(latlng, feature.geometry, 100),
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
    const {
      leaflet: {map},
    } = this.props;

    map.on("mousemove", this.onHover);
    map.on("click", this.onMapClick);
  }

  componentDidUpdate(prevProps) {
    const {location, layerIsActive} = this.props;
    const {location: prevLocation} = prevProps;

    if (!layerIsActive) {
      return;
    }

    if (location && prevLocation && !location.equals(prevLocation)) {
      this.highlightMapillaryPoint(location);
    }
  }

  componentWillUnmount() {
    const {
      leaflet: {map},
    } = this.props;

    map.off("mousemove", this.onHover);
    map.off("click", this.onMapClick);
  }

  render() {
    const {viewBbox} = this.props;

    if (!viewBbox) {
      return null;
    }

    return (
      <FeatureGroup>
        <Fetch
          options={{method: "GET"}}
          url={`https://a.mapillary.com/v3/sequences?bbox=${viewBbox.getWest()},${viewBbox.getSouth()},${viewBbox.getEast()},${viewBbox.getNorth()}&client_id=V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw`}>
          {({data, loading}) => {
            this.features = data;

            return loading ? null : (
              <GeoJSON
                style={() => ({
                  color: "rgb(50, 200, 200)",
                  weight: 3,
                  opacity: 0.75,
                })}
                data={data}
              />
            );
          }}
        </Fetch>
      </FeatureGroup>
    );
  }
}

export default MapillaryGeoJSONLayer;
