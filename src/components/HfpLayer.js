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

  stops = this.props.positions
    .filter((pos) => !!pos.receivedAt && !!pos.nextStopId)
    .reduce((stops, pos, index, allPos) => {
      const prevPos = get(allPos, `[${index - 1}]`, pos);
      const nextStopId = get(pos, "nextStopId", "");
      const prevStopId = get(prevPos, "nextStopId", nextStopId);

      if (prevStopId !== nextStopId) {
        stops.push(prevPos);
      }

      return stops;
    }, []);

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
      <React.Fragment>
        <Polyline
          onMousemove={this.onMousemove}
          onMouseover={this.onHover}
          onMouseout={this.onMouseout}
          pane="hfp"
          weight={3}
          color="green"
          positions={this.coords}
        />
        {this.stops.map((pos) => (
          <CircleMarker
            key={`hfp_stop_marker_${pos.nextStopId}`}
            center={[pos.lat, pos.long]}
            color="green"
            fill={true}
            fillColor="green"
            fillOpacity={1}
            radius={6}>
            <Tooltip>{moment(pos.receivedAt).format("HH:mm:ss")}</Tooltip>
          </CircleMarker>
        ))}
      </React.Fragment>
    );
  }
}

export default HfpLayer;
