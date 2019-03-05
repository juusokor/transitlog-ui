import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import "./Map.css";
import VehicleMarker from "./VehicleMarker";
import DivIcon from "../../helpers/DivIcon";
import HfpTooltip from "./HfpTooltip";
import {observable, action} from "mobx";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";

@inject(app("Journey"))
@observer
class HfpMarkerLayer extends Component {
  markerRef = React.createRef();

  @observable
  tooltipOpen = false;

  toggleTooltip = action((setTo = !this.tooltipOpen) => {
    this.tooltipOpen = setTo;
  });

  onMarkerClick = () => {
    this.toggleTooltip();
    const {Journey, state, currentPosition: journey} = this.props;

    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Journey.setSelectedJourney(journey);
    }
  };

  render() {
    const {currentPosition: position, isSelectedJourney = false} = this.props;

    if (!position) {
      return null;
    }

    return (
      <DivIcon
        ref={this.markerRef} // Needs ref for testing
        onClick={this.onMarkerClick}
        position={[position.lat, position.long]}
        iconSize={isSelectedJourney ? [36, 36] : [20, 20]}
        icon={
          <VehicleMarker isSelectedJourney={isSelectedJourney} position={position} />
        }
        pane={isSelectedJourney ? "hfp-markers-primary" : "hfp-markers"}>
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
