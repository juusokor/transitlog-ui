import React, {Component} from "react";
import "leaflet-draw/dist/leaflet.draw.css";
import {FeatureGroup} from "react-leaflet";
import {EditControl} from "react-leaflet-draw";

class AreaSelect extends Component {
  featureLayer = React.createRef();

  onCreated = (e) => {
    console.log(e.layer.getBounds());
  };

  onDrawStart = () => {
    if (this.featureLayer.current) {
      this.featureLayer.current.leafletElement.clearLayers();
    }
  };

  onEdited = (e) => {
    for (const layer of e.layers) {
      console.log(layer.getBounds());
    }
  };

  render() {
    return (
      <FeatureGroup ref={this.featureLayer}>
        <EditControl
          position="bottomright"
          onCreated={this.onCreated}
          onDrawStart={this.onDrawStart}
          onEdited={this.onEdited}
          draw={{
            rectangle: {
              shapeOptions: {
                weight: 2,
                dashArray: "10 4",
                opacity: 1,
                color: "white",
                fillColor: "var(--blue)",
                fillOpacity: 0.1,
              },
            },
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
