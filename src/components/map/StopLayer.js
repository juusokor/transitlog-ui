import React, {Component} from "react";
import {observer} from "mobx-react";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";

@observer
class StopLayer extends Component {
  render() {
    const {bounds, date} = this.props;

    const bbox = {
      minLat: bounds.getSouth(),
      minLon: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLon: bounds.getEast(),
    };

    return (
      <StopsByBboxQuery variables={{...bbox, date}}>
        {({stops}) => (
          <React.Fragment>
            {stops.map((stop) => (
              <StopMarker key={`stops_${stop.stopId}`} stop={stop} />
            ))}
          </React.Fragment>
        )}
      </StopsByBboxQuery>
    );
  }
}

export default StopLayer;
