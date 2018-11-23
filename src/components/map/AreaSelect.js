import React, {Component} from "react";
import "leaflet-draw/dist/leaflet.draw.css";
import {FeatureGroup} from "react-leaflet";
import {EditControl} from "react-leaflet-draw";
import get from "lodash/get";

class AreaSelect extends Component {
  featureLayer = React.createRef();

  onCreated = (e) => {
    const {layer} = e;
    const layerBounds = layer.getBounds();
    this.onBoundsSelected(layerBounds);
  };

  onDrawStart = () => {
    // Remove all current layers if we're about to draw a new one
    if (this.featureLayer.current) {
      this.featureLayer.current.leafletElement.clearLayers();
    }
  };

  onEdited = (e) => {
    const layer = get(e.layers.getLayers(), "[0]", null);

    if (layer) {
      this.onBoundsSelected(layer.getBounds());
    }
  };

  onBoundsSelected = (bounds) => {
    const {onSelectArea} = this.props;

    if (bounds && bounds.isValid()) {
      onSelectArea(bounds);
    }
  };

  render() {
    const {enabled = true} = this.props;

    return (
      <FeatureGroup ref={this.featureLayer}>
        <EditControl
          position="bottomright"
          onCreated={this.onCreated}
          onDrawStart={this.onDrawStart}
          onEdited={this.onEdited}
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
