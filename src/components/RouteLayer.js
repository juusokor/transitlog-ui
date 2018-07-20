import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";
import get from "lodash";

class RouteLayer extends Component {
  render() {
    const coords = this.props.positions.map(([lon, lat]) => [lat, lon]);

    return (
      <React.Fragment>
        <Polyline weight={3} positions={coords} />
        {this.props.stops.map((stop) => (
          <CircleMarker
            key={`stop_marker_${stop.stopId}`}
            center={[stop.lat, stop.lon]}
            color="#3388ff"
            fill={true}
            fillColor="#3388ff"
            fillOpacity={1}
            radius={6}>
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
        ))}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
