import React, {Component} from "react";
import {Polyline, Popup, CircleMarker, Tooltip} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import map from "lodash/map";
import random from "lodash/random";
import moment from "moment";

const identities = {};

class HfpLayer extends Component {
  mouseOver = false;

  coords = orderBy(
    this.props.positions.filter((pos) => !!pos.lat && !!pos.long),
    (pos) => moment(pos.receivedAt).unix()
  ).map(({lat, long, ...rest}) => {
    return [lat, long, rest];
  });

  vehicleGroups = groupBy(this.coords, (pos) =>
    get(pos, "[2].uniqueVehicleId", "unidentifiedVehicle")
  );

  findHfpItem = (latlng) => {
    const hfpItem = this.coords.find((hfp) =>
      latlng.equals(latLng(hfp[0], hfp[1]), 0.0001)
    );

    return hfpItem ? hfpItem[2] : null;
  };

  onMouseout = (event) => {
    const line = event.target;
    line.setStyle({weight: 3});
    this.mouseOver = false;
  };

  onHover = (event) => {
    this.mouseOver = true;
    const line = event.target;
    line.setStyle({weight: 10});
  };

  onMousemove = (event) => {
    if (!this.mouseOver) {
      return;
    }

    const hfpItem = this.findHfpItem(event.latlng);

    if (hfpItem) {
      const line = event.target;
      const tooltipContent = `${moment(hfpItem.receivedAt).format("HH:mm:ss")}<br />
${hfpItem.uniqueVehicleId}`;

      const lineTooltip = line.getTooltip();

      if (lineTooltip) {
        lineTooltip.setContent(tooltipContent);
      } else {
        line.bindTooltip(tooltipContent, {sticky: true}).openTooltip();
      }
    }
  };

  render() {
    return map(this.vehicleGroups, (coords, name) => {
      let color = get(identities, name);

      if (!color) {
        color = `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
        identities[name] = color;
      }

      return (
        <Polyline
          key={`hfp_polyline_${name}`}
          onMousemove={this.onMousemove}
          onMouseover={this.onHover}
          onMouseout={this.onMouseout}
          pane="hfp"
          weight={3}
          color={color}
          positions={coords}
        />
      );
    });
  }
}

export default HfpLayer;
