import React from "react";
import DriveByTimes from "./DriveByTimes";
import {Popup, Marker, CircleMarker, Tooltip} from "react-leaflet";
import {icon} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import get from "lodash/get";
import diffDates from "date-fns/difference_in_seconds";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import parse from "date-fns/parse";
import ArriveDepartToggle from "./ArriveDepartToggle";
import {combineDateAndTime} from "../../helpers/time";

const stopColor = "var(--blue)";
const selectedStopColor = "var(--dark-blue)";

@inject(app("state"))
@observer
class StopMarker extends React.Component {
  render() {
    const {
      stop,
      selected,
      firstTerminal,
      lastTerminal,
      hfp,
      showTime,
      onChangeShowTime,
      onTimeClick,
      state,
      onPopupOpen,
      onPopupClose,
    } = this.props;

    const isTerminal = firstTerminal || lastTerminal;

    const timingStopIcon = icon({
      iconUrl: TimingStopIcon,
      iconSize: [30, 30],
      iconAnchor: [23, 25 / 2],
      popupAnchor: [3, -15],
      className: "stop-marker timing-stop",
    });

    let journeyStartedOnTime;

    // TODO: Compare timing stops with real schedules

    if ((firstTerminal || stop.timingStopType) && hfp.length === 1) {
      const stopDepartHfp = get(hfp, `[0].journeys[0].depart`, "");

      const departedDate = parse(stopDepartHfp.received_at);

      let delay = 0;

      // dl is not reliable at terminals
      if (firstTerminal) {
        const journeyStartDate = new Date(
          `${state.date}T${stopDepartHfp.journey_start_time}`
        );
        delay = diffDates(journeyStartDate, departedDate);
      } else {
        delay = stopDepartHfp.dl;
      }

      // Not "on time" if started 10 or more seconds too early.
      journeyStartedOnTime = delay < 10;
    }

    const time = combineDateAndTime(
      state.date,
      state.time,
      "Europe/Helsinki"
    ).toISOString();

    return React.createElement(
      stop.timingStopType ? Marker : CircleMarker,
      {
        pane: "stops",
        icon: stop.timingStopType ? timingStopIcon : null,
        center: [stop.lat, stop.lon], // One marker type uses center...
        position: [stop.lat, stop.lon], // ...the other uses position.
        color: selected ? selectedStopColor : stopColor,
        fillColor:
          journeyStartedOnTime === true
            ? "lime"
            : journeyStartedOnTime === false
              ? "hotpink"
              : "white",
        fillOpacity: 1,
        strokeWeight: isTerminal ? 5 : 3,
        radius: isTerminal ? 12 : 8,
        onPopupopen: onPopupOpen(stop.nodeId),
        onPopupclose: onPopupClose(stop.nodeId),
      },
      <React.Fragment>
        <Tooltip>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Tooltip>
        <Popup keepInView={false} autoPan={false}>
          <h4>
            {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
          </h4>
          {hfp.length > 0 && (
            <React.Fragment>
              <ArriveDepartToggle value={showTime} onChange={onChangeShowTime} />
              <DriveByTimes
                showTime={showTime}
                onTimeClick={onTimeClick}
                queryTime={time}
                positions={hfp}
              />
            </React.Fragment>
          )}
        </Popup>
      </React.Fragment>
    );
  }
}

export default StopMarker;
