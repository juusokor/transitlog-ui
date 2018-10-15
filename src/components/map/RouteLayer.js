import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import filter from "lodash/filter";
import map from "lodash/map";
import flatMap from "lodash/flatMap";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import RouteStopMarker from "./RouteStopMarker";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import {groupHfpPositions} from "../../helpers/groupHfpPositions";

@inject(app("Time"))
@observer
class RouteLayer extends Component {
  state = {
    showTime: "arrive",
  };

  cachedPositionsByVehicle = [];
  prevPositionsLength = 0;

  onChangeShowTime = (setTo) => () => {
    this.setState({
      showTime: setTo,
    });
  };

  componentDidMount() {
    const {stops, setMapBounds = () => {}} = this.props;

    if (stops.length === 0) {
      return;
    }

    const bounds = calculateBoundsFromPositions(stops, {
      lat: 60.170988,
      lon: 24.940842,
    });

    setMapBounds(bounds);
  }

  // This method returns hfp positions for when a vehicle was at a stop.
  // The beginning of the returned array is the arrival, and the end is the departure.
  getStopPositions = (positions, stopId) => {
    return map(positions, (journeyPositions) => {
      // Get the hfp positions we're interested in. Now we are working with
      // hfp data that happens before or at the requested stop.
      const stopPos = filter(journeyPositions, (pos) => pos.next_stop_id === stopId);

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
      // containing the moment before next_stop_id was changed to the next stop.
      const sliceStart =
        firstDoorOpenPos !== -1 ? firstDoorOpenPos : stopPos.length - 1;

      return stopPos.slice(sliceStart);
    });
  };

  getArriveDepartTimes = (stopJourneys) => {
    return stopJourneys.map((journeyPositions) => {
      // The last array element is when the vehicle left the stop, ie the
      // moment before the next_stop_id prop changed to the next stop.
      const departHfp = journeyPositions[journeyPositions.length - 1];
      const arriveHfp = journeyPositions[0];

      return {arrive: arriveHfp, depart: departHfp};
    });
  };

  // Returns the stop times for the currently selected journey.
  getSelectedJourneyStopTimes = (stop, positions) => {
    const {
      state: {selectedJourney},
    } = this.props;

    const selectedJourneyId = getJourneyId(selectedJourney);

    const selectedJourneyPositions = get(
      positions.find((j) => j.journeyId === selectedJourneyId),
      "positions",
      []
    );

    return map(
      groupBy(selectedJourneyPositions, "unique_vehicle_id"),
      (positions, unique_vehicle_id) => {
        // Get the hfp positions for when this vehicle was at this stop.
        const stopJourneys = this.getStopPositions([positions], stop.stopId);

        const journeys = this.getArriveDepartTimes(stopJourneys);
        return {vehicleId: unique_vehicle_id, journeys};
      }
    );
  };

  // Returns the stop times for all journeys.
  getAllJourneysStopTimes = (stop, positions) => {
    const stopHfpGroups = positions.map(({vehicleId, positions}) => {
      const vehicleJourneys = groupBy(positions, "journey_start_time");
      // Get the hfp positions for when this vehicle was at this stop.
      // TODO: Guard against null stop
      const stopJourneys = this.getStopPositions(vehicleJourneys, stop.stopId);
      const journeys = this.getArriveDepartTimes(stopJourneys);

      // Return the journeys, grouped by the vehicle ID.
      return {vehicleId, journeys};
    });

    return stopHfpGroups;
  };

  getPositionsByVehicle = (positions) => {
    const length = positions.length;
    const prevLength = this.prevPositionsLength;

    if (length === prevLength) {
      return this.cachedPositionsByVehicle;
    }

    const dataToCache = groupHfpPositions(
      flatMap(positions, (group) => group.positions),
      "unique_vehicle_id",
      "vehicleId"
    );

    if (dataToCache && dataToCache.length !== 0) {
      this.prevPositionsLength = positions.length;
      this.cachedPositionsByVehicle = dataToCache;
    }

    return dataToCache;
  };

  onTimeClick = (receivedAtTime) => (e) => {
    e.preventDefault();
    this.props.Time.setTime(receivedAtTime);
  };

  onTogglePopup = (setTo) => (stopId) => () => {
    this.setState({
      selectedStop: setTo ? stopId : false,
    });
  };

  render() {
    const {showTime, selectedStop: selectedRouteStop} = this.state;

    const {state, positions, routeGeometry, stops} = this.props;
    const {stop: queriedStop, selectedJourney} = state;

    const selectedStop = selectedRouteStop ? selectedRouteStop : queriedStop;

    const coords = routeGeometry.map(([lon, lat]) => [lat, lon]);

    let hfp = [];
    let positionsByVehicle = [];
    const selectedStopObj = stops.find((s) => s.nodeId === selectedStop);

    if (selectedStopObj && selectedJourney) {
      hfp = this.getSelectedJourneyStopTimes(selectedStopObj, positions);
    } else if (!selectedStopObj && selectedJourney) {
      positionsByVehicle = this.getPositionsByVehicle(positions);
    }

    return (
      <React.Fragment>
        <Polyline
          pane="route-lines"
          weight={3}
          positions={coords}
          color="var(--blue)"
        />
        {stops.map((stop, index) => {
          const isSelected = stop.nodeId === selectedStop;
          // Funnily enough, the first stop is last in the array.
          const isFirst = index === stops.length - 1;
          // ...and the last stop is first.
          const isLast = index === 0;

          let stopHfp = hfp;

          if (!selectedStopObj && selectedJourney) {
            stopHfp = this.getAllJourneysStopTimes(stop, positionsByVehicle);
          }

          return (
            <RouteStopMarker
              onTimeClick={this.onTimeClick}
              onChangeShowTime={this.onChangeShowTime}
              key={`stop_marker_${stop.stopId}`}
              showTime={showTime}
              selected={isSelected}
              firstTerminal={isFirst}
              lastTerminal={isLast}
              hfp={stopHfp}
              stop={stop}
              onPopupOpen={this.onTogglePopup(true)}
              onPopupClose={this.onTogglePopup(false)}
            />
          );
        })}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
