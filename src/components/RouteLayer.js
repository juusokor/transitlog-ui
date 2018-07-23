import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash/get";
import map from "lodash/map";
import orderBy from "lodash/orderBy";
import {lighten} from "polished";
import distanceBetween from "../helpers/distanceBetween";

const stopColor = "#3388ff";
const selectedStopColor = lighten(0.2, "#3388ff");

class RouteLayer extends Component {
  stopTimes = {};

  getStopTimes = (stop) => {
    const cachedHfp = get(this, `stopTimes.${stop.stopId}`);

    if (cachedHfp) {
      return cachedHfp;
    }

    const {lat: stopLat, lon: stopLng} = stop;

    const stopHfpGroups = this.props.hfpPositions.map(({groupName, positions}) => {
      const stopHfp = [];
      const total = positions.length;
      let posIdx = 0;

      for (; posIdx < total; posIdx++) {
        const lastAdded = stopHfp[stopHfp.length - 1];
        const pos = positions[posIdx];

        if (!!lastAdded && lastAdded.journeyStartTime === pos.journeyStartTime) {
          continue;
        }

        const {lat: posLat, long: posLng} = pos;
        const distanceFromStop = distanceBetween(stopLat, stopLng, posLat, posLng);

        if (distanceFromStop < 0.01) {
          stopHfp.push(pos);
        }
      }

      return {groupName, positions: stopHfp};
    });

    const sortedGroups = orderBy(stopHfpGroups, "positions[0].receivedAt");

    this.stopTimes[stop.stopId] = sortedGroups;
    return sortedGroups;
  };

  render() {
    const {positions, selectedStop, stops} = this.props;
    const coords = positions.map(([lon, lat]) => [lat, lon]);

    return (
      <React.Fragment>
        <Polyline weight={3} positions={coords} />
        {stops.map((stop) => {
          const isSelected = stop.stopId === selectedStop.stopId;
          const hfp = this.getStopTimes(stop);

          return (
            <CircleMarker
              pane="stops"
              key={`stop_marker_${stop.stopId}`}
              center={[stop.lat, stop.lon]}
              color={isSelected ? selectedStopColor : stopColor}
              fillColor={isSelected ? selectedStopColor : stopColor}
              fillOpacity={1}
              radius={isSelected ? 8 : 6}>
              <Popup>
                <h4>
                  {stop.nameFi}, {stop.shortId.replace(/ /g, "")}
                </h4>
                {hfp.length > 0 &&
                  map(
                    hfp,
                    ({positions, groupName}) =>
                      positions.length ? (
                        <div key={`hfpPos_${groupName}`}>
                          <span>{groupName}:</span>{" "}
                          <strong>
                            {map(positions, (position) =>
                              moment(position.receivedAt).format("HH:mm:ss")
                            ).join(",  ")}
                          </strong>
                        </div>
                      ) : null
                  )}
              </Popup>
            </CircleMarker>
          );
        })}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
