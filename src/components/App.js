import React, {Component} from "react";
import get from "lodash/get";
import invoke from "lodash/invoke";
import FilterPanel from "./filterpanel/FilterPanel";
import LoadingOverlay from "./LoadingOverlay";
import "./App.css";
import "./Form.css";
import withHfpData from "../hoc/withHfpData";
import {app} from "mobx-app";
import {inject, observer} from "mobx-react";
import diffDates from "../helpers/diffDates";
import propify from "../hoc/propify";
import Map from "./map/Map";
import {latLng} from "leaflet";

function getJourneyFollowBounds(journey, time, positions) {
  let followPosition = null;

  for (const pos of positions) {
    if (Math.abs(diffDates(new Date(pos.receivedAt), time)) < 15) {
      followPosition = pos;
      break;
    }
  }

  if (followPosition) {
    return latLng([followPosition.lat, followPosition.long]).toBounds(1000);
  }

  return null;
}

@inject(app("Journey"))
@withHfpData
@propify("time") // Make time from state into a React prop
@observer
class App extends Component {
  state = {
    bounds: null,
    prevFollowingTime: "",
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      state: {selectedJourney, date},
      time,
      positionsByJourney,
    } = nextProps;

    if (!selectedJourney) {
      return {
        bounds: null,
        prevFollowingTime: "",
      };
    }

    const prevFollowingTime = get(prevState, "prevFollowingTime", "");

    if (time !== prevFollowingTime) {
      const journeyStartTime = get(selectedJourney, "journeyStartTime");

      let journeyPositions = get(
        positionsByJourney.find((j) => j.journeyStartTime === journeyStartTime),
        "positions",
        []
      );

      const timeDate = new Date(`${date}T${time}`);

      const followBounds = getJourneyFollowBounds(
        selectedJourney,
        timeDate,
        journeyPositions
      );

      if (!followBounds) {
        return null;
      }

      return {
        prevFollowingTime: time,
        bounds: followBounds,
      };
    }

    return null;
  }

  setMapBounds = (bounds = null) => {
    if (bounds && invoke(bounds, "isValid")) {
      this.setState({bounds});
    }
  };

  render() {
    const {bounds} = this.state;
    const {loading} = this.props;

    return (
      <div className="transitlog">
        <FilterPanel />
        <Map setMapBounds={this.setMapBounds} bounds={bounds} />
        <LoadingOverlay show={loading} message="Ladataan HFP-tietoja..." />
      </div>
    );
  }
}

export default App;
