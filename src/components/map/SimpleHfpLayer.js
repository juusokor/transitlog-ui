import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import moment from "moment";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {text} from "../../helpers/text";
import {createColor} from "../../helpers/vehicleColor";

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

  onMouseout = (event) => {
    const line = event.target;
    line.setStyle({weight: 2});
    this.mouseOver = false;
  };

  onHover = (event) => {
    this.mouseOver = true;
    const line = event.target;
    line.setStyle({weight: 4});
  };

  onMousemove = (positions) => (event) => {
    if (!this.mouseOver) {
      return;
    }

    const hfpItem = this.findHfpItem(positions, event.latlng);

    if (hfpItem) {
      const line = event.target;
      const tooltipContent = `${moment(hfpItem.received_at).format("HH:mm:ss")}<br />
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
    const {name, positions} = this.props;

    return (
      <React.Fragment>
        <Polyline
          key={`hfp_polyline_${name}`}
          onMousemove={this.onMousemove(positions)}
          onMouseover={this.onHover}
          onMouseout={this.onMouseout}
          pane="hfp-lines"
          weight={2}
          color={createColor()}
          positions={positions.map((pos) => [pos.lat, pos.long])}
        />
      </React.Fragment>
    );
  }
}

export default SimpleHfpLayer;
