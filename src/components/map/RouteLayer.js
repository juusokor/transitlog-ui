import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import filter from "lodash/filter";
import map from "lodash/map";
import DriveByTimes from "./DriveByTimes";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import RouteQuery from "../../queries/RouteQuery";
import StopMarker from "./StopMarker";

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
    const {mapBounds, stops, setMapBounds = () => {}} = this.props;

    if (stops.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(stops, {
      lat: 60.170988,
      lon: 24.940842,
    });

    if (
      !mapBounds ||
      (mapBounds && mapBounds.isValid() && !mapBounds.equals(bounds))
    ) {
      setMapBounds(bounds);
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

    const {selectedStop, queryTime, queryDate, routePositions, stops} = this.props;

    const queryTimeMoment = moment(
      `${queryDate} ${queryTime}`,
      "YYYY-MM-DD HH:mm:ss",
      true
    );

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

          const hfp = this.getStopTimes(stop);

          return (
            <StopMarker
              onTimeClick={this.onTimeClick}
              onChangeShowTime={this.onChangeShowTime}
              key={`stop_marker_${stop.stopId}`}
              showTime={showTime}
              queryTime={queryTimeMoment}
              selected={isSelected}
              firstTerminal={isFirst}
              lastTerminal={isLast}
              hfp={hfp}
              stop={stop}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
