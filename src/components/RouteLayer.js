import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash";
import {lighten, darken} from "polished";

const stopColor = "#3388ff";
const selectedStopColor = "#00ff88";

class RouteLayer extends Component {
  render() {
    const {positions, selectedStop, stops} = this.props;
    const coords = positions.map(([lon, lat]) => [lat, lon]);

    return (
      <React.Fragment>
        <Polyline weight={3} positions={coords} />
        {stops.map((stop) => {
          const isSelected = stop.stopId === selectedStop;

          return (
            <CircleMarker
              pane="stops"
              key={`stop_marker_${stop.stopId}`}
              center={[stop.lat, stop.lon]}
              color={isSelected ? lighten(0.2, selectedStopColor) : stopColor}
              fillColor={isSelected ? selectedStopColor : stopColor}
              fillOpacity={1}
              radius={isSelected ? 10 : 6}>
              <Popup>
                {stop.nameFi}, {stop.shortId.replace(/ /g, "")}
                {get(stop, "distanceFromStop", 1) < 0.1 && (
                  <React.Fragment>
                    <br />
                    Drive-by time:{" "}
                    {moment(get(stop, "hfp.receivedAt")).format("HH:mm:ss")}
                  </React.Fragment>
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
