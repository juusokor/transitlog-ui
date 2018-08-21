import React, {Component} from "react";
import get from "lodash/get";
import FilterPanel from "./filterpanel/FilterPanel";
import LoadingOverlay from "./LoadingOverlay";
import "./App.css";
import "./Form.css";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import Map from "./map/Map";
import {latLng} from "leaflet";
import getCoarsePositionForTime from "../helpers/getCoarsePositionForTime";

@inject(app("Journey"))
@withHfpData
@observer
class App extends Component {
  render() {
    const {
      loading,
      state: {selectedJourney, date, time},
      positionsByJourney,
      positionsByVehicle,
    } = this.props;

    let journeyBounds = null;

    if (selectedJourney) {
      const journeyStartTime = get(selectedJourney, "journeyStartTime");
      const timeDate = new Date(`${date}T${time}`);

      const pos = getCoarsePositionForTime(
        positionsByJourney,
        journeyStartTime,
        timeDate
      );

      if (pos) {
        journeyBounds = latLng([pos.lat, pos.long]).toBounds(1000);
      }
    }

    return (
      <div className="transitlog">
        <FilterPanel />
        <Map positionsByVehicle={positionsByVehicle} bounds={journeyBounds} />
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
