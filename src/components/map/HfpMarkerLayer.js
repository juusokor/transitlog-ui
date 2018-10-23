import React, {Component} from "react";
import {Tooltip, Marker} from "react-leaflet";
import get from "lodash/get";
import reduce from "lodash/reduce";
import moment from "moment";
import {divIcon} from "leaflet";
import getDelayType from "../../helpers/getDelayType";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import {combineDateAndTime} from "../../helpers/time";
import {Text} from "../../helpers/text";

import "./Map.css";
import {observable, runInAction, reaction} from "mobx";
import animationFrame from "../../helpers/animationFrame";
import idle from "../../helpers/idle";

@inject(app("state"))
@observer
class HfpMarkerLayer extends Component {
  prevJourneyId = "";
  positions = new Map();

  @observable.ref
  hfpPosition = null;

  positionReaction = () => {};

  // Matches the current time setting with a HFP position from this journey.
  getHfpPosition = async (time, date) => {
    await animationFrame();

    const timestamp = combineDateAndTime(date, time, "Europe/Helsinki").unix();
    const positionKeys = this.positions.keys();

    let nextHfpPosition = null;
    let prevClosestTime = 180;

    for (const timeKey of positionKeys) {
      const difference = Math.abs(timeKey - timestamp);

      if (difference < prevClosestTime) {
        prevClosestTime = difference;
        nextHfpPosition = this.positions.get(timeKey);
      }
    }

    runInAction(() => (this.hfpPosition = nextHfpPosition));
  };

  onMarkerClick = (positionWhenClicked) => () => {
    const {onMarkerClick} = this.props;
    onMarkerClick(positionWhenClicked);
  };

  indexPositions = async (positions) => {
    await idle();

    const indexed = positions.reduce((positionIndex, position) => {
      const key = moment.tz(position.received_at, "Europe/Helsinki").unix();
      positionIndex.set(key, position);
      return positionIndex;
    }, new Map());

    runInAction(() => (this.positions = indexed));
  };

  componentDidMount() {
    const {state, positions} = this.props;
    this.indexPositions(positions);

    this.positionReaction = reaction(
      () => state.time,
      (time) => {
        if (time && this.positions.size !== 0) {
          this.getHfpPosition(time, state.date);
        }
      }
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
    const color =
      delayType === "early"
        ? "var(--red)"
        : delayType === "late"
          ? "var(--yellow)"
          : "var(--green)";

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
