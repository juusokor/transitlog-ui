import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);

  render() {
    const {stops} = this.props;

    return (
      <React.Fragment>
        <Polyline weight={3} positions={this.coords} />
        {stops.map(({stop}) => (
          <CircleMarker
            key={`stop_marker_${stop.stopId}`}
            center={[stop.lat, stop.lon]}
            color="#3388ff"
            fill={true}
            fillColor="#3388ff"
            fillOpacity={1}
            radius={6}>
            <Popup> {[stop.nameFi, " ", stop.shortId.replace(/ /g, "")]} </Popup>
          </CircleMarker>
        ))}
      </React.Fragment>
    );
  }
}

export default RouteLayer;
