import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import moment from "moment-timezone";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {text} from "../../helpers/text";
import {interpolateRange} from "../../helpers/interpolateRange";
import {TIMEZONE} from "../../constants";

@inject(app("state"))
@observer
class SimpleHfpLayer extends Component {
  mouseOver = false;

  findHfpItem = (positions = [], latlng) => {
    const hfpItem = positions.find((hfp) =>
      latlng.equals(latLng(hfp.lat, hfp.long), 0.0001)
    );

    return hfpItem || null;
  };

  onMouseout = () => {
    this.mouseOver = false;
  };

  onHover = () => {
    this.mouseOver = true;
  };

  onMousemove = (positions) => (event) => {
    if (!this.mouseOver) {
      return;
    }

    const hfpItem = this.findHfpItem(positions, event.latlng);

    if (hfpItem) {
      const line = event.target;
      const tooltipContent = `${moment
        .tz(hfpItem.tst, TIMEZONE)
        .format("HH:mm:ss")}<br />
${hfpItem.route_id} / ${hfpItem.direction_id}<br />
${hfpItem.unique_vehicle_id}<br />
${text("vehicle.speed")}: ${Math.round((hfpItem.spd * 18) / 5)} km/h`;

      const lineTooltip = line.getTooltip();

      if (lineTooltip) {
        lineTooltip.setContent(tooltipContent);
      } else {
        line.bindTooltip(tooltipContent, {sticky: true}).openTooltip();
      }
    }
  };

  render() {
    const {zoom, name, positions} = this.props;

    const opacity = interpolateRange(zoom, 15, 20, 0.05, 0.5, 0.2);
    const weight = interpolateRange(zoom, 15, 20, 2, 5, 0.2);

    return (
      <Polyline
        key={`hfp_polyline_${name}`}
        onMousemove={this.onMousemove(positions)}
        onMouseover={this.onHover}
        onMouseout={this.onMouseout}
        pane="hfp-lines"
        weight={weight}
        color="var(--red)"
        opacity={opacity}
        positions={positions.map((pos) => [pos.lat, pos.long])}
      />
    );
  }
}

export default SimpleHfpLayer;
