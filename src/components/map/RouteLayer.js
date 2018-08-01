import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import flatten from "lodash/flatten";
import filter from "lodash/filter";
import map from "lodash/map";
import {darken} from "polished";
import distanceBetween from "../../helpers/distanceBetween";
import DriveByTimes from "./DriveByTimes";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import RouteQuery from "../../queries/RouteQuery";

const stopColor = "#3388ff";
const selectedStopColor = darken(0.2, stopColor);

class RouteLayer extends Component {
  stopTimes = {};
  state = {
    showTime: "arrive",
  };

  onChangeShowTime = (e) => {
    this.setState({
      showTime: e.target.value,
    });
  };

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

  // This method returns hfo positions for when a vehicle was at the requested stop
  // grouped by journey.
  getHfpStopsForJourney = (positions, stopId) => {
    // Group the hfp data into distinct journeys
    const journeyGroups = groupBy(positions, "journeyStartTime");

    return map(journeyGroups, (journeyPositions) => {
      // Get the hfp positions we're interested in. Now we are working with
      // hfp data that happens before or at the requested stop.
      const stopPos = filter(journeyPositions, (pos) => pos.nextStopId === stopId);

      if (stopPos.length === 0) {
        return [];
      }

      let doorCheckIdx = stopPos.length - 1;
      let firstDoorOpenPos = -1;
      // Loop through the positions in reverse and determine when the doors were
      // opened. The loop breaks when an open door has been found and the current
      // hfp item does not have open doors.
      while (doorCheckIdx >= 0) {
        const pos = stopPos[doorCheckIdx];

        if (pos.drst) {
          // "door status"
          // We're interested in the index of the hfp position when the door was open.
          firstDoorOpenPos = doorCheckIdx;
        } else if (firstDoorOpenPos > -1) {
          // If we have an open door and it's closed now, break out of the loop.
          break;
        }

        doorCheckIdx--;
      }

      // Cut a slice of the hfp data for when the vehicle was at the stop.
      // If the doors were never opened, just return an array of length 1
      // containing the moment before nextStopId was changed to the next stop.
      const sliceStart =
        firstDoorOpenPos !== -1 ? firstDoorOpenPos : stopPos.length - 1;

      return stopPos.slice(sliceStart);
    });
  };

  getStopTimes = (stop) => {
    // Get existing times from the cache.
    if (Object.keys(this.stopTimes).length > 0) {
      const cachedHfp = get(this, `stopTimes.${stop.stopId}`);

      if (cachedHfp && cachedHfp.length > 0) {
        return cachedHfp;
      }
    }

    // Hfp positions are delivered grouped by the vehicle ID,
    // which suits this component splendidly.
    const stopHfpGroups = this.props.hfpPositions.map(({groupName, positions}) => {
      // Get the hfp positions for when this vehicle was at this stop.
      const stopJourneys = this.getHfpStopsForJourney(positions, stop.stopId);
      const journeys = stopJourneys.map((journeyPositions) => {
        // The last array element is when the vehicle left the stop, ie the
        // moment before the nextStopId prop changed to the next stop.
        const departHfp = journeyPositions[journeyPositions.length - 1];
        const arriveHfp = journeyPositions[0];

        return {arrive: arriveHfp, depart: departHfp};
      });

      // Return the journeys, grouped by the vehicle ID.
      return {groupName, journeys};
    });

    this.stopTimes[stop.stopId] = stopHfpGroups;
    return stopHfpGroups;
  };

  onTimeClick = (receivedAtMoment) => (e) => {
    e.preventDefault();
    this.props.onChangeQueryTime(receivedAtMoment.format("HH:mm:ss"));
  };

  render() {
    const {showTime} = this.state;
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
                // Funnily enough, the first stop is last in the array.
                const isFirst = index === stops.length - 1;
                // ...and the last stop is first.
                const isLast = index === 0;
                const isTerminal = isFirst || isLast;

                const hfp = this.getStopTimes(stop);

                return (
                  <CircleMarker
                    pane="stops"
                    key={`stop_marker_${stop.stopId}`}
                    center={[stop.lat, stop.lon]}
                    color={
                      isFirst
                        ? "green"
                        : isLast
                          ? "red"
                          : isSelected
                            ? selectedStopColor
                            : stopColor
                    }
                    fillColor="white"
                    fillOpacity={1}
                    strokeWeight={3}
                    radius={isSelected ? 14 : isTerminal ? 10 : 8}>
                    {route.direction}
                    <Popup>
                      <h4>
                        {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({
                          stop.stopId
                        })
                      </h4>
                      {hfp.length > 0 && (
                        <React.Fragment>
                          <div>
                            <label>
                              <input
                                type="radio"
                                value="arrive"
                                checked={showTime === "arrive"}
                                name="showTime"
                                onChange={this.onChangeShowTime}
                              />{" "}
                              Arrive
                            </label>
                            <label>
                              <input
                                type="radio"
                                value="depart"
                                checked={showTime === "depart"}
                                name="showTime"
                                onChange={this.onChangeShowTime}
                              />{" "}
                              Depart
                            </label>
                          </div>
                          <DriveByTimes
                            showTime={showTime}
                            onTimeClick={this.onTimeClick}
                            queryTime={queryTimeMoment}
                            positions={hfp}
                          />
                        </React.Fragment>
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
