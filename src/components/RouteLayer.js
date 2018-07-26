import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import {darken} from "polished";
import distanceBetween from "../helpers/distanceBetween";
import DriveByTimes from "./DriveByTimes";
import calculateBoundsFromPositions from "../helpers/calculateBoundsFromPositions";

const stopColor = "#3388ff";
const selectedStopColor = darken(0.2, stopColor);

class RouteLayer extends Component {
  stopTimes = {};
  state = {}; // Needs to be here for gDSFP to work. Not used otherwise.

  static getDerivedStateFromProps({stops, mapBounds, setMapBounds = () => {}}) {
    if (stops && stops.length > 0) {
      const bounds = calculateBoundsFromPositions(stops, {
        lat: 60.170988,
        lng: 24.940842,
      });

      if ((mapBounds && !mapBounds.equals(bounds)) || !mapBounds) {
        setMapBounds(bounds);
      }
    }

    return null;
  }

  getStopTimes = (stop) => {
    if (Object.keys(this.stopTimes).length > 0) {
      const cachedHfp = get(this, `stopTimes.${stop.stopId}`);

      if (cachedHfp && cachedHfp.length > 0) {
        return cachedHfp;
      }
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

  onTimeClick = (receivedAtMoment) => (e) => {
    e.preventDefault();
    this.props.onChangeQueryTime(receivedAtMoment.format("HH:mm:ss"));
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
        <Polyline pane="route-lines" weight={3} positions={coords} />
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
              radius={isSelected ? 10 : 6}>
              <Popup>
                <h4>
                  {stop.nameFi}, {stop.shortId.replace(/ /g, "")}
                </h4>
                {hfp.length > 0 && (
                  <DriveByTimes
                    onTimeClick={this.onTimeClick}
                    queryTime={queryTimeMoment}
                    positions={hfp}
                  />
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
