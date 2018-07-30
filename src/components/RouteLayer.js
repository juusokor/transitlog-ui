import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import map from "lodash/map";
import {darken} from "polished";
import distanceBetween from "../helpers/distanceBetween";
import DriveByTimes from "./DriveByTimes";
import calculateBoundsFromPositions from "../helpers/calculateBoundsFromPositions";
import RouteQuery from "../queries/RouteQuery";

const stopColor = "#3388ff";
const selectedStopColor = darken(0.2, stopColor);

class RouteLayer extends Component {
  stopTimes = {};

  componentDidUpdate() {
    const {stops, mapBounds, setMapBounds = () => {}} = this.props;

    if (stops && stops.length > 0) {
      const bounds = calculateBoundsFromPositions(stops, {
        lat: 60.170988,
        lng: 24.940842,
      });

      if ((mapBounds && !mapBounds.equals(bounds)) || !mapBounds) {
        setMapBounds(bounds);
      }
    }
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
      let driveByTimes = groupBy(positions, "journeyStartTime");
      driveByTimes = map(driveByTimes, (journeyPositions) => {
        const closestPositions = [];
        let posIdx = 0;

        while (closestPositions.length < 50) {
          const pos = journeyPositions[posIdx];

          if (!pos) {
            break;
          }

          const maxDistance = pos.mode.toUpperCase() === "TRAIN" ? 0.5 : 0.05; // 0.5 km for trains, 50m for others.
          const distanceFromStop = distanceBetween(
            stopLat,
            stopLng,
            pos.lat,
            pos.long
          );

          if (distanceFromStop < maxDistance) {
            closestPositions.push({...pos, distanceFromStop});
          }

          posIdx++;
        }

        const closestTimes = orderBy(
          closestPositions,
          ["distanceFromStop", "receivedAt"],
          ["asc", "desc"]
        );

        const withOpenDoors = closestTimes.filter((c) => c.drst);

        if (withOpenDoors.length > 0) {
          return withOpenDoors[0];
        }

        return closestTimes[0] || null;
      });

      return {groupName, positions: flatten(driveByTimes)};
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
    const {selectedStop, route, queryTime, queryDate} = this.props;

    const queryTimeMoment = moment(
      `${queryDate} ${queryTime}`,
      "YYYY-MM-DD HH:mm:ss",
      true
    );

    return (
      <RouteQuery route={route}>
        {({routePositions, stops}) => {
          const coords = routePositions.map(([lon, lat]) => [lat, lon]);

          return (
            <React.Fragment>
              <Polyline pane="route-lines" weight={3} positions={coords} />
              {stops.map((stop, index) => {
                const isSelected = stop.stopId === selectedStop.stopId;
                const isFirst = index === stops.length - 1;
                const isLast = index === 0;
                const isTerminal = isFirst || isLast;

                const hfp = this.getStopTimes(stop);

                return (
                  <CircleMarker
                    pane="stops"
                    key={`stop_marker_${stop.stopId}`}
                    center={[stop.lat, stop.lon]}
                    color="white"
                    fillColor={
                      isFirst
                        ? "green"
                        : isLast
                          ? "red"
                          : isSelected
                            ? selectedStopColor
                            : stopColor
                    }
                    fillOpacity={1}
                    strokeWeight={2}
                    shadow={true}
                    radius={isSelected ? 14 : isTerminal ? 10 : 8}>
                    {route.direction}
                    <Popup>
                      <h4>
                        {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({
                          stop.stopId
                        })
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
        }}
      </RouteQuery>
    );
  }
}

export default RouteLayer;
