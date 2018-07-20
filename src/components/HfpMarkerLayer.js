import React, {Component} from "react";
import {CircleMarker, Tooltip} from "react-leaflet";
import get from "lodash/get";
import random from "lodash/random";
import moment from "moment";
import {darken, lighten} from "polished";

const identities = {};

class HfpMarkerLayer extends Component {
  onMouseout = (color) => (event) => {
    const marker = event.target;
    marker.setStyle({weight: 3, fillColor: color, color: darken(0.2, color)});
  };

  onHover = (color) => (event) => {
    const marker = event.target;
    marker.setStyle({
      weight: 5,
      fillColor: lighten(0.2, color),
      color: lighten(0.1, color),
    });
  };

  render() {
    const {position} = this.props;

    const name = position.uniqueVehicleId;
    let color = get(identities, name);

    if (!color) {
      color = `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
      identities[name] = color;
    }

    return (
      <React.Fragment>
        <CircleMarker
          center={[position.lat, position.long]}
          onMouseover={this.onHover(color)}
          onMouseout={this.onMouseout(color)}
          fillColor={color}
          fillOpacity={1}
          weight={3}
          radius={12}
          color={darken(0.2, color)}>
          <Tooltip>
            {moment(position.receivedAt).format("HH:mm:ss")}
            <br />
            {name}
          </Tooltip>
        </CircleMarker>
      </React.Fragment>
    );
  }
}

export default HfpMarkerLayer;
