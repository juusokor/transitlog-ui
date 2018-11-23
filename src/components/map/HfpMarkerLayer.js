import React, {Component} from "react";
import PropTypes from "prop-types";
import {Tooltip, Marker} from "react-leaflet";
import get from "lodash/get";
import moment from "moment";
import {divIcon} from "leaflet";
import getDelayType from "../../helpers/getDelayType";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {Text} from "../../helpers/text";
import "./Map.css";
import {observable, action, reaction, runInAction} from "mobx";
import animationFrame from "../../helpers/animationFrame";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import doubleDigit from "../../helpers/doubleDigit";

@inject(app("state"))
@observer
class HfpMarkerLayer extends Component {
  static propTypes = {
    onMarkerClick: PropTypes.func.isRequired,
  };

  prevJourneyId = "";
  positions = new Map();

  @observable.ref
  hfpPosition = null;

  positionReaction = () => {};

  // Matches the current time setting with a HFP position from this journey.
  getHfpPosition = async (time) => {
    await animationFrame();
    // Attempt to find the correct hfp item from the indexed positions
    let nextHfpPosition = this.positions.get(time);

    if (!nextHfpPosition) {
      let minTime = time - 10;
      let maxTime = time + 10;

      let checkSeconds = minTime;

      while (!nextHfpPosition && checkSeconds <= maxTime) {
        nextHfpPosition = this.positions.get(checkSeconds);
        checkSeconds += 1;
      }
    }

    this.setHfpPosition(nextHfpPosition);
  };

  setHfpPosition = action((nextHfpPosition) => {
    this.hfpPosition = nextHfpPosition;
  });

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick} = this.props;

    if (typeof onMarkerClick === "function") {
      onMarkerClick(positionWhenClicked);
    }
  };

  indexPositions = async (positions) => {
    await animationFrame();

    const indexed = positions.reduce((positionIndex, position) => {
      const key = position.received_at_unix;

      positionIndex.set(key, {
        ...position,
        received_at_formatted: moment(position.received_at).format("HH:mm:ss"),
      });

      return positionIndex;
    }, new Map());

    runInAction(() => (this.positions = indexed));
  };

  async componentDidMount() {
    const {state, positions} = this.props;
    await this.indexPositions(positions);

    this.positionReaction = reaction(
      () => [state.unixTime, this.positions.size],
      ([time, positionsSize]) => {
        if (time && positionsSize !== 0) {
          this.getHfpPosition(time);
        }
      },
      {fireImmediately: true}
    );
  }

  componentDidUpdate() {
    const {journeyId, positions} = this.props;

    if (positions.length !== 0 && journeyId !== this.prevJourneyId) {
      this.indexPositions(positions);
      this.prevJourneyId = journeyId;
    }
  }

  componentWillUnmount() {
    if (typeof this.positionReaction === "function") {
      // Dispose the reaction
      this.positionReaction();
    }
  }

  render() {
    const position = this.hfpPosition;

    if (!position) {
      return null;
    }

    const delayType = getDelayType(position.dl);
    const color = getTimelinessColor(delayType, "var(--light-green)");

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
          {position.received_at_formatted}
          <br />
          {position.unique_vehicle_id}
          <br />
          <Text>vehicle.next_stop</Text>: {position.next_stop_id}
          <br />
          <Text>vehicle.speed</Text>: {Math.round((position.spd * 18) / 5)} km/h
          {position.dl !== 0 && (
            <React.Fragment>
              <br />
              {position.dl < 0 ? (
                <Text>vehicle.delay.late</Text>
              ) : (
                <Text>vehicle.delay.early</Text>
              )}{" "}
              {Math.abs(position.dl)}: <Text>general.seconds.short</Text>
            </React.Fragment>
          )}
        </Tooltip>
      </Marker>
    );
  }
}

export default HfpMarkerLayer;
