import React, {Component} from "react";
import PropTypes from "prop-types";
import {Tooltip, Marker} from "react-leaflet";
import {divIcon} from "leaflet";
import {observer} from "mobx-react";
import {Text} from "../../helpers/text";
import "./Map.css";
import VehicleMarker from "./VehicleMarker";

@observer
class HfpMarkerLayer extends Component {
  static propTypes = {
    onMarkerClick: PropTypes.func.isRequired,
  };

  markerRef = React.createRef();

  // The markerIcon needs to be created here so that
  // the instance does not change between rerenders
  icon = divIcon({
    className: "hfp-icon",
    iconSize: 36,
    html: "hfp-icon", // Needed for test
  });

  componentDidMount() {}

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

    return (
      <Marker
        ref={this.markerRef}
        onClick={this.onMarkerClick(position)}
        position={[position.lat, position.long]}
        icon={this.icon}
        pane="hfp-markers">
        {this.markerRef.current && (
          <VehicleMarker
            parent={this.markerRef.current.leafletElement._icon}
            position={position}
          />
        )}
        <Tooltip>
          <strong>
            {position.route_id} / {position.direction_id}
          </strong>
          <br />
          {position.received_at}
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
