import React, {Component} from "react";
import {Tooltip, Marker} from "react-leaflet";
import get from "lodash/get";
import moment from "moment";
import {divIcon} from "leaflet";
import getDelayType from "../../helpers/getDelayType";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {getPrecisePositionForTime} from "../../helpers/getPrecisePositionForTime";

@inject(app("state"))
@observer
class HfpMarkerLayer extends Component {
  prevQueryTime = "";
  prevHfpPosition = null;

  // Matches the current time setting with a HFP position from this journey.
  getHfpPosition = () => {
    const {positions, state} = this.props;
    const {date, time} = state;

    if (!time || time === this.prevQueryTime) {
      return this.prevHfpPosition;
    }

    const timeDate = new Date(`${date}T${time}`);

    const nextHfpPosition = getPrecisePositionForTime(positions, timeDate);

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
          {moment(position.received_at).format("HH:mm:ss")}
          <br />
          {position.unique_vehicle_id}
          <br />
          Next stop: {position.next_stop_id}
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
