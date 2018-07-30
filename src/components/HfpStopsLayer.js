import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import {getColor} from "../helpers/vehicleColor";
import flatten from "lodash/flatten";
import groupBy from "lodash/groupBy";
import get from "lodash/get";
import map from "lodash/map";
import distanceBetween from "../helpers/distanceBetween";

class HfpStopsLayer extends Component {
  getHfpStops = () => {
    const {positions: hfpPositions} = this.props;
    const allPositions = get(hfpPositions, "[0].positions", []); // flatten(hfpPositions.map(({ positions }) => positions));
    const journeyGroups = groupBy(allPositions, "journeyStartTime");

    const journeyStops = map(journeyGroups, (journeyPositions) => {
      const stops = groupBy(journeyPositions, "nextStopId");
      return map(stops, (positions) => {
        let doorCheckIdx = positions.length - 1;
        let firstDoorOpenPos = -1;

        while (doorCheckIdx > 0) {
          const pos = positions[doorCheckIdx];

          if (pos.drst) {
            firstDoorOpenPos = doorCheckIdx;
          } else if (firstDoorOpenPos > -1) {
            break;
          }

          doorCheckIdx--;
        }

        const sliceStart =
          firstDoorOpenPos > -1 ? firstDoorOpenPos : positions.length - 10;
        return positions.slice(sliceStart);
      });
    });

    return Object.values(journeyStops)[0] || [];
  };

  render() {
    const stops = this.getHfpStops();

    console.log(stops);

    return stops.map(
      (stopPositions) =>
        stopPositions.length > 0 ? (
          <Polyline
            key={`hfp_stop_polyline_${stopPositions[0].nextStopId}`}
            pane="hfp-lines"
            weight={3}
            color="#ff4455"
            positions={stopPositions.map(({lat, long}) => ({lat, lng: long}))}
          />
        ) : null
    );
  }
}

export default HfpStopsLayer;
