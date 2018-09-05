import React, {Component} from "react";
import {Tooltip, Marker} from "react-leaflet";
import get from "lodash/get";
import moment from "moment";
import {divIcon} from "leaflet";
import getDelayType from "../../helpers/getDelayType";
import diffDates from "date-fns/difference_in_seconds";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

@inject(app("state"))
@observer
class HfpMarkerLayer extends Component {
  prevQueryTime = "";
  prevHfpPosition = null;
  prevPositionIndex = 0;

  // Matches the current time setting with a HFP position from this journey.
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
      // This acts as the upper limit for when a time matches a marker.
      // If it is too low, markers for selected journeys might not match.
      let prevDifference = 180;

      if (nextHfpPosition) {
        const nextHfpDate = new Date(nextHfpPosition.receivedAt);
        const diff = Math.abs(diffDates(timeDate, nextHfpDate));
        prevDifference = diff < prevDifference ? diff : prevDifference;

        // A diff of under 7 seconds is "good enough" and will break the loop.
        // Increase this number to get faster but less precise performance. Do not
        // decrease below the time resolution of the HFP data the app uses (as of writing 2 seconds).
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
    const {onMarkerClick} = this.props;
    onMarkerClick(positionWhenClicked);
  };

  render() {
    const position = this.getHfpPosition();

    if (!position) {
      return null;
    }

    const delayType = getDelayType(position.dl);
    const color =
      delayType === "early" ? "red" : delayType === "late" ? "yellow" : "green";

    const markerIcon = divIcon({
      className: `hfp-icon`,
      iconSize: 32,
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
          {position.uniqueVehicleId}
          <br />
          Next stop: {position.nextStopId}
          <br />
          Speed: {Math.round((position.spd * 18) / 5)} km/h
          <br />
          Delay: {position.dl} sek.
        </Tooltip>
      </Marker>
    );
  }
}

export default HfpMarkerLayer;
