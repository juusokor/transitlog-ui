import React, {Component} from "react";
import {Polyline, Popup, CircleMarker, Tooltip} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import moment from "moment";

class HfpLayer extends Component {
  mouseOver = false;

  coords = this.props.positions
    .filter((pos) => !!pos.lat && !!pos.long)
    .map(({lat, long, ...rest}) => {
      return [lat, long, rest];
    });

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
    return (
      <Polyline
        onMousemove={this.onMousemove}
        onMouseover={this.onHover}
        onMouseout={this.onMouseout}
        pane="hfp"
        weight={3}
        color="green"
        positions={this.coords}
      />
    );
  }
}

export default HfpLayer;
