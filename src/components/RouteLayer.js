import React, {Component} from "react";
import {Polyline, CircleMarker, Popup} from "react-leaflet";
import distanceBetween from "../helpers/distanceBetween";
import moment from "moment";

class RouteLayer extends Component {
  coords = this.props.positions.map(([lon, lat]) => [lat, lon]);

  stops = this.props.stops.reduce((stops, {stop}) => {
    const {lat: stopLat, lon: stopLng} = stop;
    const firstHfp = this.props.hfpPositions[0];
    let hfp;

    if (firstHfp) {
      const initialClosest = {
        pos: firstHfp,
        distance: distanceBetween(stopLat, stopLng, firstHfp.lat, firstHfp.long),
      };

      hfp = this.props.hfpPositions.reduce((closest, pos) => {
        if (closest.distance < 0.005) {
          return closest;
        }

        const {lat: posLat, long: posLng} = pos;

        const distance = distanceBetween(stopLat, stopLng, posLat, posLng);
        return distance < closest.distance
          ? {
              distance,
              pos,
            }
          : closest;
      }, initialClosest);
    }

    const hfpStop = {
      ...stop,
      hfp: hfp ? hfp.pos : null,
    };

    stops.push(hfpStop);
    return stops;
  }, []);

  render() {
    return (
      <React.Fragment>
        <Polyline weight={3} positions={this.coords} />
        {this.stops.map((stop) => (
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
