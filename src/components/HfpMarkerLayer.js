import React, {Component} from "react";
import {CircleMarker, Tooltip} from "react-leaflet";
import get from "lodash/get";
import random from "lodash/random";
import moment from "moment";
import {darken, lighten} from "polished";

const identities = {};

class HfpMarkerLayer extends Component {
  prevQueryTime = "";
  prevHfpPosition = null;

  getHfpPosition = () => {
    const {positions, queryDate, queryTime} = this.props;

    if (!queryTime || queryTime === this.prevQueryTime) {
      return this.prevHfpPosition;
    }

    const queryTimeMoment = moment(
      `${queryDate} ${queryTime}`,
      "YYYY-MM-DD HH:mm:ss",
      true
    );

    const nextHfpPosition = positions.reduce((chosenPosition, position) => {
      let prevDifference = 30;

      if (chosenPosition) {
        prevDifference = Math.abs(
          queryTimeMoment.diff(moment(chosenPosition.receivedAt), "seconds")
        );

        if (prevDifference < 3) {
          return chosenPosition;
        }
      }

      const difference = Math.abs(
        queryTimeMoment.diff(moment(position.receivedAt), "seconds")
      );

      if (difference < prevDifference) {
        return position;
      }

      return chosenPosition;
    }, null);

    this.prevHfpPosition = nextHfpPosition;
    this.prevQueryTime = queryTime;

    return nextHfpPosition;
  };

  render() {
    const {name} = this.props;
    let color = get(identities, name);

    const position = this.getHfpPosition();

    if (!position) {
      return null;
    }

    if (!color) {
      color = `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
      identities[name] = color;
    }

    return (
      <React.Fragment>
        <CircleMarker
          center={[position.lat, position.long]}
          fillColor={color}
          fillOpacity={1}
          weight={3}
          radius={12}
          color={darken(0.2, color)}>
          <Tooltip>
            {moment(position.receivedAt).format("HH:mm:ss")}
            <br />
            {name}
          </Tooltip>
        </CircleMarker>
      </React.Fragment>
    );
  }
}

export default HfpMarkerLayer;
