import React from "react";
import {Marker, CircleMarker, Tooltip} from "react-leaflet";
import {icon} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import {observer} from "mobx-react";
import DepartureJourneyQuery from "../../queries/DepartureJourneyQuery";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import {observable} from "mobx";

const stopColor = "var(--blue)";

@observer
class RouteStopMarker extends React.Component {
  createStopMarker = (
    stop,
    color,
    isSelected,
    isTerminal,
    onSelect,
    children = null
  ) => {
    const timingStopIcon = icon({
      iconUrl: TimingStopIcon,
      iconSize: [30, 30],
      iconAnchor: [23, 25 / 2],
      popupAnchor: [3, -15],
      className: "stop-marker timing-stop",
    });

    return React.createElement(
      stop.timingStopType ? Marker : CircleMarker,
      {
        pane: "stops",
        icon: stop.timingStopType ? timingStopIcon : null,
        center: [stop.lat, stop.lon], // One marker type uses center...
        position: [stop.lat, stop.lon], // ...the other uses position.
        color: color,
        fillColor: isSelected ? stopColor : "white",
        fillOpacity: 1,
        strokeWeight: isTerminal ? 5 : 3,
        radius: isTerminal ? 12 : isSelected ? 10 : 8,
        onClick: onSelect,
      },
      <React.Fragment>
        <Tooltip>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Tooltip>
        {children}
      </React.Fragment>
    );
  };

  @observable
  departureJourneys = [];

  componentDidMount() {}

  render() {
    const {
      stop,
      selected,
      firstTerminal,
      lastTerminal,
      departures,
      date,
      onSelect,
    } = this.props;

    const isTerminal = firstTerminal || lastTerminal;

    // Show a marker without the popup if we don't have any data
    if (!departures || departures.length === 0) {
      return this.createStopMarker(stop, stopColor, selected, isTerminal, onSelect);
    }

    // TODO: Find the departure for the selected journey
    const departure = departures[0];

    return (
      <DepartureJourneyQuery departure={departure} date={date}>
        {({journey}) => {
          let delayType = "on-time";

          if (journey) {
            const plannedObservedDiff = diffDepartureJourney(
              journey,
              departure,
              date
            );
            // Not "on time" if started 10 or more seconds too early.
            delayType = getDelayType(plannedObservedDiff.diff);
          }

          const color =
            delayType === "early"
              ? "var(--red)"
              : delayType === "late"
                ? "var(--yellow)"
                : "var(--light-green)";

          return this.createStopMarker(stop, color, selected, isTerminal, onSelect);
        }}
      </DepartureJourneyQuery>

      /*const popup = (
        <Popup
          keepInView={ false }
          autoPan={ false }
          autoClose={ false }
          maxHeight={ 550 }
          maxWidth={ 500 }
          minWidth={ 350 }>
          <Heading level={ 4 }>
            { stop.nameFi }, { stop.shortId.replace(/ /g, "") } ({ stop.stopId })
          </Heading>
          <React.Fragment>
            <ArriveDepartToggle value={ showTime } onChange={ onChangeShowTime } />
            <DriveByTimes
              isFirst={ firstTerminal }
              showTime={ showTime }
              onTimeClick={ onTimeClick }
              date={ state.date }
              route={ state.route }
              stop={ stop }
            />
          </React.Fragment>
        </Popup>
      )*/
    );
  }
}

export default RouteStopMarker;
