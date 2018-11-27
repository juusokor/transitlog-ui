import React, {Component} from "react";
import "leaflet-draw/dist/leaflet.draw.css";
import {FeatureGroup, Rectangle} from "react-leaflet";
import {EditControl} from "react-leaflet-draw";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import {getUrlValue, setUrlValue} from "../../stores/UrlManager";
import {latLngBounds} from "leaflet";
import {observable, action} from "mobx";
import {setResetListener} from "../../stores/FilterStore";

// The key under which the bounds will be recorded in the URL.
const AREA_BOUNDS_URL_KEY = "areaBounds";

// Leaflet path style
const rectangleStyle = {
  weight: 2,
  dashArray: "10 4",
  opacity: 1,
  color: "white",
  fillColor: "var(--blue)",
  fillOpacity: 0.1,
};

@inject(app("state"))
@observer
class AreaSelect extends Component {
  featureLayer = React.createRef();

  @observable.ref
  initialRectangle = false;

  @action
  setInitialRectangle = (bounds) => {
    this.initialRectangle = bounds;
  };

  onCreated = (e) => {
    const {layer} = e;
    const layerBounds = layer.getBounds();
    this.onBoundsSelected(layerBounds);

    // Record the bounds in the URL
    setUrlValue(AREA_BOUNDS_URL_KEY, layerBounds.toBBoxString());
  };

  clearAreas = () => {
    // Remove all current layers if we're about to draw a new one or have resetted the UI.
    if (this.featureLayer.current) {
      this.featureLayer.current.leafletElement.clearLayers();
    }

    // Also clear the URL value
    setUrlValue(AREA_BOUNDS_URL_KEY, "");
  };

  onBoundsSelected = (bounds) => {
    const {onSelectArea} = this.props;

    if (bounds && bounds.isValid()) {
      onSelectArea(bounds);
    }
  };

  componentDidMount() {
    setResetListener(this.clearAreas);

    // The url value is a stringified bbox created with bounds.toBBoxString()
    const urlBounds = getUrlValue(AREA_BOUNDS_URL_KEY);

    if (urlBounds) {
      const splitUrlBounds = urlBounds.split(",");

      // Make sure the parts go into the correct places. Check leaflet docs if unsure.
      const bounds = latLngBounds(
        [splitUrlBounds[1], splitUrlBounds[0]],
        [splitUrlBounds[3], splitUrlBounds[2]]
      );

      // Trigger the queries of the hfp events inside the bounds area.
      this.onBoundsSelected(bounds);
      // Set the bounds from the url into local state so it can be shown on the map as a rectangle.
      this.setInitialRectangle(bounds);
    }
  }

  render() {
    const {enabled = true} = this.props;

    return (
      <FeatureGroup ref={this.featureLayer}>
        <EditControl
          position="bottomright"
          onCreated={this.onCreated}
          onDrawStart={this.clearAreas} // Clear rectangles when the user is about to draw a new one
          edit={{
            // Disable edit and remove buttons
            edit: false,
            remove: false,
          }}
          draw={{
            rectangle: enabled
              ? {
                  shapeOptions: rectangleStyle,
                }
              : false,
            polyline: false,
            polygon: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
        />
        {this.initialRectangle && (
          // If there were bounds set in the URL, draw them on the map
          <Rectangle bounds={this.initialRectangle} {...rectangleStyle} />
        )}
      </FeatureGroup>
    );
  }
}

export default AreaSelect;
