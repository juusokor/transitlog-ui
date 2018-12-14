import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";
import {app} from "mobx-app";
import {expr} from "mobx-utils";

@inject(app("state"))
@observer
class StopLayer extends Component {
  render() {
    const {
      state: {mapOverlays},
      bounds,
      date,
      onViewLocation,
    } = this.props;

    const bbox = {
      minLat: bounds.getSouth(),
      minLon: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLon: bounds.getEast(),
    };

    const showRadius = expr(() => mapOverlays.indexOf("Stop radius") !== -1);

    return (
      <StopsByBboxQuery variables={{...bbox, date}}>
        {({stops}) =>
          stops.map((stop) => (
            <StopMarker
              showRadius={showRadius}
              onViewLocation={onViewLocation}
              key={`stops_${stop.stopId}`}
              stop={stop}
            />
          ))
        }
      </StopsByBboxQuery>
    );
  }
}

export default StopLayer;
