import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import set from "lodash/set";
import last from "lodash/last";
import moment from "moment";
import getDelayType from "../../helpers/getDelayType";

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

  componentWillUnmount() {
    console.log("unmount hfp line");
  }

  render() {
    const {name} = this.props;

    // Split the positions into chunks by the delay.
    const positionDelayChunks = this.positions.reduce((allChunks, position) => {
      const positionDelay = get(position, "[2].dl", 0);
      const delayType = getDelayType(positionDelay); // "early", "late" or "on-time"

      set(position, "[2]._dlType", delayType); // Save the delay type on the position

      // If this is the first position, allChunks will be empty.
      // Add it as a new chunk to kick things off.
      if (allChunks.length === 0) {
        allChunks.push([position]);
        return allChunks;
      }

      // Check the last element of the last chunk to determine if we want to push
      // `position` onto the last chunk or start a new chunk for it.
      const lastDelayType = get(last(last(allChunks)), "[2]._dlType", "on-time");

      // If the delay types are the same, add the position to the last chunk.
      if (delayType === lastDelayType) {
        allChunks[allChunks.length - 1].push(position);
      } else {
        // Otherwise start a new chunk.
        allChunks.push([position]);
      }

      return allChunks;
    }, []);

    return (
      <React.Fragment>
        {positionDelayChunks.map((delayChunk, index) => {
          const chunkDelayType = get(delayChunk, "[0][2]._dlType", "on-time");

          // Render each chunk with a color that matches the delay.
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
