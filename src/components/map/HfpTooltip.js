import React, {Component} from "react";
import {Tooltip} from "react-leaflet";
import moment from "moment-timezone";
import {observer} from "mobx-react";

@observer
class HfpTooltip extends Component {
  prevPosition = null;

  render() {
    const {position} = this.props;
    let usePosition = position || this.prevPosition;

    if (!usePosition) {
      return null;
    }

    if (position) {
      this.prevPosition = position;
    }

    return (
      <Tooltip sticky={true}>
        <strong>
          {usePosition.route_id} / {usePosition.direction_id}
        </strong>
        <br />
        {moment
          .tz(usePosition.received_at, "Europe/Helsinki")
          .format("YYYY-MM-DD HH:mm:ss")}
        <br />
        {usePosition.unique_vehicle_id}
        <br />
        {Math.round((usePosition.spd * 18) / 5)} km/h
      </Tooltip>
    );
  }
}

export default HfpTooltip;
