import React, {Component} from "react";
import PropTypes from "prop-types";
import {Tooltip} from "react-leaflet";
import {observer} from "mobx-react";
import {Text} from "../../helpers/text";
import "./Map.css";
import VehicleMarker from "./VehicleMarker";
import DivIcon from "../../helpers/DivIcon";

@observer
class HfpMarkerLayer extends Component {
  static propTypes = {
    onMarkerClick: PropTypes.func.isRequired,
  };

  markerRef = React.createRef();

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick} = this.props;
    onMarkerClick(positionWhenClicked);
  };

  render() {
    const {currentPosition: position} = this.props;

    if (!position) {
      return null;
    }

    return (
      <DivIcon
        ref={this.markerRef}
        onClick={this.onMarkerClick(position)}
        position={[position.lat, position.long]}
        iconSize={[35, 35]}
        icon={<VehicleMarker position={position} />}
        pane="hfp-markers">
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
      </DivIcon>
    );
  }
}

export default HfpMarkerLayer;
