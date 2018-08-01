import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import set from "lodash/set";
import last from "lodash/last";
import moment from "moment";
import {getColor} from "../../helpers/vehicleColor";

class HfpLayer extends Component {
  mouseOver = false;
  positions = this.getLine();

  getLine() {
    const {selectedVehicle: selectedVehiclePosition, positions} = this.props;
    const journeyStartTime = get(selectedVehiclePosition, "journeyStartTime", null);

    // Get only the positions from the same journey and create latNg items for Leaflet.
    // Additional data can be passed as the third array element which Leaflet won't touch.
    return positions
      .filter((pos) => pos.journeyStartTime === journeyStartTime)
      .map(({lat, long, receivedAt, uniqueVehicleId, spd, dl}) => [
        lat,
        long,
        {receivedAt, uniqueVehicleId, spd, dl},
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

    const positionDelayChunks = this.positions.reduce((allChunks, position) => {
      const positionDelay = get(position, "[2].dl", 0);
      const delayType =
        positionDelay >= 60 ? "early" : positionDelay <= 60 * 3 ? "late" : "on-time";

      set(position, "[2]._dlType", delayType);

      if (allChunks.length === 0) {
        allChunks.push([position]);
        return allChunks;
      }

      const lastDelayType = get(last(last(allChunks)), "[2]._dlType", "on-time");

      if (delayType === lastDelayType) {
        allChunks[allChunks.length - 1].push(position);
      } else {
        allChunks.push([position]);
      }

      return allChunks;
    }, []);

    return (
      <React.Fragment>
        {positionDelayChunks.map((delayChunk, index) => {
          const chunkDelayType = get(delayChunk, "[0][2]._dlType", 0);

          return (
            <Polyline
              key={`hfp_polyline_${name}_chunk_${index}`}
              onMousemove={this.onMousemove}
              onMouseover={this.onHover}
              onMouseout={this.onMouseout}
              pane="hfp-lines"
              weight={3}
              color={
                chunkDelayType === "early"
                  ? "red"
                  : chunkDelayType === "late"
                    ? "yellow"
                    : "green"
              }
              positions={delayChunk}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default HfpLayer;
