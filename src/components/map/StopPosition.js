import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withStop from "../../hoc/withStop";
import {latLng} from "leaflet";

@inject(app("state"))
@withStop
@observer
class StopPosition extends Component {
  getStopPosition = (stop) => {
    if (stop) {
      return latLng(stop.lat, stop.lon);
    }

    return false;
  };

  render() {
    const {stop, children} = this.props;
    const stopPosition = this.getStopPosition(stop);
    return children(stopPosition);
  }
}

export default StopPosition;
