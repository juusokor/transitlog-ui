import React, {Component} from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import {observer} from "mobx-react";
import "./Map.css";
import {getModeColor} from "../../helpers/vehicleColor";
import VehicleMarker from "./VehicleMarker";
import DivIcon from "../../helpers/DivIcon";
import HfpTooltip from "./HfpTooltip";
import {observable, action} from "mobx";

@observer
class HfpMarkerLayer extends Component {
  static propTypes = {
    onMarkerClick: PropTypes.func.isRequired,
  };

  @observable
  tooltipOpen = false;

  toggleTooltip = action((setTo = !this.tooltipOpen) => {
    this.tooltipOpen = setTo;
  });

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick} = this.props;

    this.toggleTooltip();

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

    return (
      <DivIcon
        onClick={this.onMarkerClick(position)}
        position={[position.lat, position.long]}
        iconSize={[36, 36]}
        icon={<VehicleMarker position={position} color={modeColor} />}
        pane="hfp-markers">
        <HfpTooltip
          key={`permanent=${this.tooltipOpen}`}
          position={position}
          permanent={this.tooltipOpen}
          sticky={false}
        />
      </DivIcon>
    );
  }
}

export default HfpMarkerLayer;
