import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import moment from "moment";

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
              {!!stop.hfp && (
                <React.Fragment>
                  <br />
                  Drive-by time: {moment(stop.hfp.receivedAt).format("HH:mm:ss")}
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
