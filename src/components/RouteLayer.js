import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);

  render() {
    const {stops} = this.props;

    return (
      <React.Fragment>
        <Polyline weight={5} positions={this.coords} />
        {stops.map(({stop}) => (
          <CircleMarker
            key={`stop_marker_${stop.stopId}`}
            center={[stop.lat, stop.lon]}
            color="#007ac9"
            radius={10}>
            <Popup> {[stop.nameFi, " ", stop.shortId.replace(/ /g, "")]} </Popup>
          </CircleMarker>
        ))}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
