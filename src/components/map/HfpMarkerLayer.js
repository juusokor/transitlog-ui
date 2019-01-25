import React, {Component} from "react";
import PropTypes from "prop-types";
import {Tooltip, Marker} from "react-leaflet";
import get from "lodash/get";
import {divIcon} from "leaflet";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {Text} from "../../helpers/text";
import "./Map.css";
import {getModeColor} from "../../helpers/vehicleColor";

@inject(app("state"))
@observer
class HfpMarkerLayer extends Component {
  static propTypes = {
    onMarkerClick: PropTypes.func.isRequired,
  };

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick} = this.props;

    if (typeof onMarkerClick === "function") {
      onMarkerClick(positionWhenClicked);
    }
  };

  render() {
    const {currentPosition: position} = this.props;

    if (!position) {
      return null;
    }

    const modeColor = getModeColor(get(position, "mode", "").toUpperCase());

    const markerIcon = divIcon({
      className: `hfp-icon`,
      iconSize: 36,
      html: `<span class="hfp-marker-wrapper" style="background-color: ${modeColor}">
<div class="hfp-marker-icon ${get(
        position,
        "mode",
        ""
      ).toUpperCase()}" style="transform: rotate(${position.hdg - 180}deg)"></div>
${position.drst ? `<span class="hfp-marker-drst"></span>` : ""}
<span class="hfp-marker-heading" style="transform: rotate(${
        position.hdg
      }deg) translate(0, -82%); border-bottom-color: ${modeColor}"></span>
</span>`,
    });

    return (
      <Marker
        onClick={this.onMarkerClick(position)}
        position={[position.lat, position.long]}
        icon={markerIcon}
        pane="hfp-markers">
        <Tooltip>
          <strong>
            {position.route_id} / {position.direction_id}
          </strong>
          <br />
          {position.received_at_formatted}
          <br />
          {position.unique_vehicle_id}
          <br />
          <Text>vehicle.next_stop</Text>: {position.next_stop_id}
          <br />
          <Text>vehicle.speed</Text>: {Math.round((position.spd * 18) / 5)} km/h
        </Tooltip>
      </Marker>
    );
  }
}

export default HfpMarkerLayer;
