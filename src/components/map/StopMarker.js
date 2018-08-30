import React from "react";
import {darken} from "polished";
import DriveByTimes from "./DriveByTimes";
import {Popup, Marker, CircleMarker, Tooltip} from "react-leaflet";
import {icon} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import get from "lodash/get";
import reverse from "lodash/reverse";
import diffDates from "date-fns/difference_in_seconds";

const stopColor = "#3388ff";
const selectedStopColor = darken(0.2, stopColor);

export default ({
  stop,
  selected,
  firstTerminal,
  lastTerminal,
  hfp,
  showTime,
  time,
  onChangeShowTime,
  onTimeClick,
}) => {
  const isTerminal = firstTerminal || lastTerminal;

  const timingStopIcon = icon({
    iconUrl: TimingStopIcon,
    iconSize: [30, 30],
    iconAnchor: [23, 25 / 2],
    popupAnchor: [3, -15],
    className: "stop-marker timing-stop",
  });

  let journeyStartedOnTime;

  if (firstTerminal && hfp.length === 1) {
    const date = time.format("YYYY-MM-DD");
    const journeyStartHfp = get(reverse(hfp), `[0].journeys[0].depart`, "");

    const startedDate = new Date(journeyStartHfp.receivedAt);
    const journeyStartDate = new Date(`${date}T${journeyStartHfp.journeyStartTime}`);

    journeyStartedOnTime = Math.abs(diffDates(startedDate, journeyStartDate)) <= 60;
  }

  return React.createElement(
    stop.timingStopType ? Marker : CircleMarker,
    {
      pane: "stops",
      icon: stop.timingStopType ? timingStopIcon : null,
      center: [stop.lat, stop.lon],
      position: [stop.lat, stop.lon],
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
            <div>
              <label>
                <input
                  type="radio"
                  value="arrive"
                  checked={showTime === "arrive"}
                  name="showTime"
                  onChange={onChangeShowTime}
                />{" "}
                Arrive
              </label>
              <label>
                <input
                  type="radio"
                  value="depart"
                  checked={showTime === "depart"}
                  name="showTime"
                  onChange={onChangeShowTime}
                />{" "}
                Depart
              </label>
            </div>
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
};
