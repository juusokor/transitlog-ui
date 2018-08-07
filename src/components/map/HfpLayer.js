import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {latLng} from "leaflet";
import get from "lodash/get";
import set from "lodash/set";
import last from "lodash/last";
import moment from "moment";
import getDelayType from "../../helpers/getDelayType";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

@inject(app("state"))
@observer
class HfpLayer extends Component {
  mouseOver = false;

  getLine() {
    const {selectedVehicle: selectedVehiclePosition, positions} = this.props;
    const journeyStartTime = get(selectedVehiclePosition, "journeyStartTime", null);

    // Get only the positions from the same journey and create latNg items for Leaflet.
    // Additional data can be passed as the third array element which Leaflet won't touch.
    return positions
      .filter((pos) => pos.journeyStartTime === journeyStartTime)
      .reduce((allChunks, position) => {
        const positionDelay = get(position, "dl", 0);
        const delayType = getDelayType(positionDelay); // "early", "late" or "on-time"

        set(position, "_dlType", delayType); // Save the delay type on the position

        // If this is the first position, allChunks will be empty.
        // Add it as a new chunk to kick things off.
        if (allChunks.length === 0) {
          allChunks.push([position]);
          return allChunks;
        }

        // Check the last element of the last chunk to determine if we want to push
        // `position` onto the last chunk or start a new chunk for it.
        const lastItem = last(last(allChunks));
        const lastDelayType = get(lastItem, "_dlType", "on-time");

        // If the delay types are the same, add the position to the last chunk.
        if (delayType === lastDelayType) {
          allChunks[allChunks.length - 1].push(position);
        } else {
          // Otherwise start a new chunk. Include the last element from the
          // previous chunk to eliminate gaps in the line.
          allChunks.push([lastItem, position]);
        }

        return allChunks;
      }, []);
  }

  findHfpItem = (positions, latlng) => {
    const hfpItem = positions.find((hfp) =>
      latlng.equals(latLng(hfp.lat, hfp.long), 0.0001)
    );

    return hfpItem || null;
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

  onMousemove = (positions) => (event) => {
    if (!this.mouseOver) {
      return;
    }

    const hfpItem = this.findHfpItem(positions, event.latlng);

    if (hfpItem) {
      const line = event.target;
      const tooltipContent = `${moment(hfpItem.receivedAt).format("HH:mm:ss")}<br />
${hfpItem.uniqueVehicleId}<br />
Speed: ${hfpItem.spd} km/h<br />
Delay: ${hfpItem.dl} sek.`;

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
    const positions = this.getLine();

    return (
      <React.Fragment>
        {positions.map((delayChunk, index) => {
          // Check the SECOND array element for the delay type. The first
          // element might be of the previous type, included to eliminate gaps.
          const chunkDelayType = get(delayChunk, "[1]._dlType", "on-time");

          // Render each chunk with a color that matches the delay.
          return (
            <Polyline
              key={`hfp_polyline_${name}_chunk_${index}`}
              onMousemove={this.onMousemove(delayChunk)}
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
              positions={delayChunk.map((pos) => [pos.lat, pos.long])}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default HfpLayer;
