import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash/get";
import map from "lodash/map";
import orderBy from "lodash/orderBy";
import {lighten} from "polished";
import distanceBetween from "../helpers/distanceBetween";
import "./Popup.css";

const stopColor = "#3388ff";
const selectedStopColor = lighten(0.2, "#22ccaa");

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
    const {positions, selectedStop, stops, queryTime, queryDate} = this.props;
    const coords = positions.map(([lon, lat]) => [lat, lon]);

    const queryTimeMoment = moment(
      `${queryDate} ${queryTime}`,
      "YYYY-MM-DD HH:mm:ss",
      true
    );

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
                  map(hfp, ({positions, groupName}) => {
                    return positions.length ? (
                      <div className="hfp-time-row" key={`hfpPos_${groupName}`}>
                        <span>{groupName}:</span>{" "}
                        {map(positions, (position) => {
                          const receivedAtMoment = moment(position.receivedAt);

                          const diffFromQuery = Math.min(
                            Math.abs(
                              queryTimeMoment.diff(receivedAtMoment, "seconds")
                            ),
                            125
                          );

                          return (
                            <strong
                              style={{
                                backgroundColor: `rgb(50, ${diffFromQuery *
                                  2}, ${diffFromQuery})`,
                              }}
                              className="hfp-time-tag">
                              {receivedAtMoment.format("HH:mm:ss")}{" "}
                            </strong>
                          );
                        })}
                      </div>
                    ) : null;
                  })}
              </Popup>
            </CircleMarker>
          );
        })}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
