import React, {Component} from "react";
import {Polyline} from "react-leaflet";
import calculateBoundsFromPositions from "../../helpers/calculateBoundsFromPositions";
import RouteStopMarker from "./RouteStopMarker";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import DeparturesQuery from "../../queries/DeparturesQuery";
import DepartureJourneyQuery from "../../queries/DepartureJourneyQuery";

@inject(app("Time", "Filters"))
@observer
class RouteLayer extends Component {
  state = {
    showTime: "arrive",
  };

  onChangeShowTime = (setTo) => () => {
    this.setState({
      showTime: setTo,
    });
  };

  toggleStopOpen = (stopId = null) => () => {
    const {stop} = this.props.state;

    if (stopId !== null && stop !== stopId) {
      this.props.Filters.setStop(stopId);
    }
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

  onTimeClick = (receivedAtTime) => (e) => {
    e.preventDefault();
    this.props.Time.setTime(receivedAtTime);
  };

  getStopMarker = (stop, isSelected, isFirst, isLast, departures = []) => (
    <RouteStopMarker
      key={`stop_marker_${stop.stopId}`}
      onTimeClick={this.onTimeClick}
      onChangeShowTime={this.onChangeShowTime}
      key={`stop_marker_${stop.stopId}`}
      showTime={this.state.showTime}
      selected={isSelected}
      firstTerminal={isFirst}
      lastTerminal={isLast}
      departures={departures}
      stop={stop}
      date={this.props.state.date}
      onSelect={this.toggleStopOpen(stop.stopId)}
    />
  );

  render() {
    const {state, routeGeometry, stops} = this.props;
    const {stop: selectedStop, date, selectedJourney} = state;

    const coords = routeGeometry.map(([lon, lat]) => [lat, lon]);

    return (
      <React.Fragment>
        <Polyline
          pane="route-lines"
          weight={3}
          positions={coords}
          color="var(--blue)"
        />
        {stops.map((stop, index) => {
          console.log(stop);

          const isSelected = stop.stopId === selectedStop;
          // Funnily enough, the first stop is last in the array.
          const isFirst = index === stops.length - 1;
          // ...and the last stop is first.
          const isLast = index === 0;

          if (!selectedJourney) {
            return this.getStopMarker(stop, isSelected, isFirst, isLast, []);
          }

          const {route_id, direction_id} = selectedJourney;

          return (
            <DeparturesQuery
              stop={stop}
              date={date}
              route={{
                routeId: route_id,
                direction: direction_id,
              }}
              key={`stop_marker_query_${stop.stopId}`}>
              {({departures}) =>
                this.getStopMarker(stop, isSelected, isFirst, isLast, departures)
              }
            </DeparturesQuery>
          );
        })}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
