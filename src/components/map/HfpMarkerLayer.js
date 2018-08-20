import React, {Component} from "react";
import {Tooltip, Marker} from "react-leaflet";
import get from "lodash/get";
import moment from "moment";
import {divIcon} from "leaflet";
import getDelayType from "../../helpers/getDelayType";
import diffDates from "../../helpers/diffDates";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

@inject(app("state"))
@observer
class HfpMarkerLayer extends Component {
  prevQueryTime = "";
  prevHfpPosition = null;
  prevPositionIndex = 0;

  getHfpPosition = () => {
    const {positions, state} = this.props;
    const {date, time} = state;

    if (!time || time === this.prevQueryTime) {
      return this.prevHfpPosition;
    }

    const timeDate = new Date(`${date}T${time}`);

    let nextHfpPosition = null;
    const total = positions.length;
    let posIdx = this.prevPositionIndex < total ? this.prevPositionIndex : 0;

    for (; posIdx < total; posIdx++) {
      const position = positions[posIdx];
      let prevDifference = 30;

      if (nextHfpPosition) {
        const nextHfpDate = new Date(nextHfpPosition.receivedAt);
        prevDifference = Math.abs(diffDates(timeDate, nextHfpDate));

        if (prevDifference < 7) {
          break;
        }
      }

      const difference = Math.abs(
        diffDates(timeDate, new Date(position.receivedAt))
      );

      if (difference < prevDifference) {
        nextHfpPosition = position;
      }
    }

    this.prevHfpPosition = nextHfpPosition;
    this.prevQueryTime = time;

    return nextHfpPosition;
  };

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick, selectedJourney} = this.props;

    onMarkerClick(
      get(selectedJourney, "uniqueVehicleId", "") !==
        positionWhenClicked.uniqueVehicleId ||
      get(selectedJourney, "journeyStartTime", "") !==
        positionWhenClicked.journeyStartTime
        ? positionWhenClicked
        : null
    );
  };

  render() {
    const {name} = this.props;
    const position = this.getHfpPosition();

    if (!position) {
      return null;
    }

    const delayType = getDelayType(position.dl);
    const color =
      delayType === "early" ? "red" : delayType === "late" ? "yellow" : "green";

    const markerIcon = divIcon({
      className: `hfp-icon`,
      iconSize: 25,
      html: `<span class="hfp-marker-wrapper" style="background-color: ${color}">
<span class="hfp-marker-icon ${get(position, "mode", "").toUpperCase()}" />
${position.drst ? `<span class="hfp-marker-drst" />` : ""}
</span>`,
    });

    return (
      <Marker
        onClick={this.onMarkerClick(position)}
        position={[position.lat, position.long]}
        icon={markerIcon}
        pane="hfp-markers">
        <Tooltip>
          {moment(position.receivedAt).format("HH:mm:ss")}
          <br />
          {name}
          <br />
          Next stop: {position.nextStopId}
          <br />
          Speed: {position.spd}
          <br />
          Delay: {position.dl} sek.
        </Tooltip>
      </Marker>
    );
  }
}

export default HfpMarkerLayer;
