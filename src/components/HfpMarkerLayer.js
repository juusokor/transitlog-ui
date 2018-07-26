import React, {Component} from "react";
import {Tooltip, Marker} from "react-leaflet";
import get from "lodash/get";
import moment from "moment";
import {getColor} from "../helpers/vehicleColor";
import {divIcon} from "leaflet";

class HfpMarkerLayer extends Component {
  prevQueryTime = "";
  prevHfpPosition = null;
  prevPositionIndex = 0;

  getHfpPosition = () => {
    const {positions, queryDate, queryTime} = this.props;

    if (!queryTime || queryTime === this.prevQueryTime) {
      return this.prevHfpPosition;
    }

    const queryTimeMoment = moment(
      `${queryDate} ${queryTime}`,
      "YYYY-MM-DD HH:mm:ss",
      true
    );

    let nextHfpPosition = null;
    const total = positions.length;
    let posIdx = this.prevPositionIndex < total ? this.prevPositionIndex : 0;

    for (; posIdx < total; posIdx++) {
      const position = positions[posIdx];
      let prevDifference = 30;

      if (nextHfpPosition) {
        prevDifference = Math.abs(
          queryTimeMoment.diff(moment(nextHfpPosition.receivedAt), "seconds")
        );

        if (prevDifference < 5) {
          break;
        }
      }

      const difference = Math.abs(
        queryTimeMoment.diff(moment(position.receivedAt), "seconds")
      );

      if (difference < prevDifference) {
        nextHfpPosition = position;
      }
    }

    this.prevHfpPosition = nextHfpPosition;
    this.prevQueryTime = queryTime;

    return nextHfpPosition;
  };

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick, selectedVehicle} = this.props;

    onMarkerClick(
      get(selectedVehicle, "uniqueVehicleId", null) !==
      positionWhenClicked.uniqueVehicleId
        ? positionWhenClicked
        : null
    );
  };

  render() {
    const {name} = this.props;
    const color = getColor(name);

    const position = this.getHfpPosition();

    if (!position) {
      return null;
    }

    const markerIcon = divIcon({
      className: `hfp-icon`,
      iconSize: 25,
      html: `<span class="hfp-marker-color" style="background-color: ${color}">
<span class="hfp-marker-icon ${get(position, "mode", "").toUpperCase()}" />
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
        </Tooltip>
      </Marker>
    );
  }
}

export default HfpMarkerLayer;
