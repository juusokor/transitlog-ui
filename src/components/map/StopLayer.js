import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";
import StopMarker from "./StopMarker";
import {app} from "mobx-app";

@inject(app("Filters"))
@observer
class StopLayer extends Component {
  selectStop = (which) => (e) => {
    const {Filters} = this.props;
    Filters.setStop(which);
  };

  render() {
    const {bounds, state} = this.props;
    const {date, stop: selectedStop} = state;

    return (
      <StopsByBboxQuery variables={{...bounds, date}}>
        {({stops}) => (
          <React.Fragment>
            {stops.map((stop) => (
              <StopMarker
                key={`stop_marker_${stop.stopId}`}
                date={date}
                stop={stop}
                selected={selectedStop === stop.stopId}
                onSelectStop={this.selectStop}
              />
            ))}
          </React.Fragment>
        )}
      </StopsByBboxQuery>
    );
  }
}

export default StopLayer;
