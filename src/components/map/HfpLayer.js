import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import moment from "moment";
import {getColor} from "../../helpers/vehicleColor";

class HfpLayer extends Component {
  mouseOver = false;
  positions = this.getLine();

  getLine() {
    const {selectedVehicle: selectedVehiclePosition, positions} = this.props;
    const journeyStartTime = get(selectedVehiclePosition, "journeyStartTime", null);

    return positions
      .filter((pos) => pos.journeyStartTime === journeyStartTime)
      .map(({lat, long, receivedAt, uniqueVehicleId, spd}) => [
        lat,
        long,
        {receivedAt, uniqueVehicleId, spd},
      ]);
  }

  findHfpItem = (latlng) => {
    const hfpItem = this.positions.find((hfp) =>
      latlng.equals(latLng(hfp[0], hfp[1]), 0.001)
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
${hfpItem.uniqueVehicleId}<br />
Speed: ${hfpItem.spd} km/h`;

      const lineTooltip = line.getTooltip();

      if (lineTooltip) {
        lineTooltip.setContent(tooltipContent);
      } else {
        line.bindTooltip(tooltipContent, {sticky: true}).openTooltip();
      }
    }
  };

  render() {
    const {name} = this.props;
    const color = getColor(name);

    return (
      <React.Fragment>
        <Polyline
          key={`hfp_polyline_${name}`}
          onMousemove={this.onMousemove}
          onMouseover={this.onHover}
          onMouseout={this.onMouseout}
          pane="hfp-lines"
          weight={3}
          color={color}
          positions={this.positions}
        />
      </React.Fragment>
    );
  }
}

export default HfpLayer;
