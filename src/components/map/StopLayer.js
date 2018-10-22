import React, {Component} from "react";
import {observer} from "mobx-react";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";

@observer
class StopLayer extends Component {
  render() {
    const {bounds, date} = this.props;

    return (
      <StopsByBboxQuery variables={{...bounds, date}}>
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
