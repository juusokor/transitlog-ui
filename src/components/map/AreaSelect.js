import React, {Component} from "react";
import "leaflet-draw/dist/leaflet.draw.css";
import {FeatureGroup} from "react-leaflet";
import {EditControl} from "react-leaflet-draw";
import {inject} from "mobx-react";
import {app} from "mobx-app";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";
import {latLngBounds} from "leaflet";

const AREA_BOUNDS_URL_KEY = "areaBounds";

@inject(app("state"))
class AreaSelect extends Component {
  featureLayer = React.createRef();

  onCreated = (e) => {
    const {layer} = e;
    const layerBounds = layer.getBounds();
    this.onBoundsSelected(layerBounds);

    setUrlValue(AREA_BOUNDS_URL_KEY, layerBounds.toBBoxString());
  };

  clearAreas = () => {
    // Remove all current layers if we're about to draw a new one
    if (this.featureLayer.current) {
      this.featureLayer.current.leafletElement.clearLayers();
    }
  };

  onBoundsSelected = (bounds) => {
    const {onSelectArea} = this.props;

    if (bounds && bounds.isValid()) {
      onSelectArea(bounds);
    }
  };

  componentDidMount() {
    const {state} = this.props;
    state.setResetListener(this.clearAreas);

    const urlBounds = getUrlValue(AREA_BOUNDS_URL_KEY);

    if (urlBounds) {
      const splitUrlBounds = urlBounds.split(",");

      const bounds = latLngBounds(
        [splitUrlBounds[1], splitUrlBounds[0]],
        [splitUrlBounds[3], splitUrlBounds[2]]
      );

      this.onBoundsSelected(bounds);
    }
  }

  render() {
    const {enabled = true} = this.props;

    return (
      <FeatureGroup ref={this.featureLayer}>
        <EditControl
          position="bottomright"
          onCreated={this.onCreated}
          onDrawStart={this.clearAreas}
          edit={{
            edit: false,
            remove: false,
          }}
          draw={{
            rectangle: enabled
              ? {
                  shapeOptions: {
                    weight: 2,
                    dashArray: "10 4",
                    opacity: 1,
                    color: "white",
                    fillColor: "var(--blue)",
                    fillOpacity: 0.1,
                  },
                }
              : false,
            polyline: false,
            polygon: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
        />
      </FeatureGroup>
    );
  }
}

export default AreaSelect;
