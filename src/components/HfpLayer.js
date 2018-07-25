import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import moment from "moment";
import {getColor} from "../helpers/vehicleColor";

class HfpLayer extends Component {
  mouseOver = false;

  findHfpItem = (latlng) => {
    const {positions} = this.props;

    const hfpItem = positions.find((hfp) =>
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
    const {name, positions} = this.props;
    const color = getColor(name);

    const linePositions = positions.map((hfp) => [hfp.lat, hfp.long]);
    linePositions.shift();

    return (
      <Polyline
        key={`hfp_polyline_${name}`}
        onMousemove={this.onMousemove()}
        onMouseover={this.onHover}
        onMouseout={this.onMouseout}
        pane="hfp-lines"
        weight={3}
        color={color}
        positions={linePositions}
      />
    );
  }
}

export default HfpLayer;
