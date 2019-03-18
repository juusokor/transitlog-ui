import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import AreaHfpQuery from "../queries/AreaHfpQuery";
import invoke from "lodash/invoke";
import {getMomentFromDateTime} from "../helpers/time";
import {setResetListener} from "../stores/FilterStore";
import {TIMEZONE} from "../constants";
import {action, observable} from "mobx";

@inject(app("state"))
@observer
class AreaHfpEvents extends Component {
  disposeResetListener = () => {};

  @observable.ref
  queryBounds = null;

  @action
  setQueryBounds = (bounds) => {
    const current = this.queryBounds;

    if (!bounds || !invoke(bounds, "isValid")) {
      this.queryBounds = null;
    }

    if (current && current.isValid() && current.equals(bounds)) {
      return;
    }

    this.queryBounds = bounds;
  };

  getBoundsForQuery = (bounds) => {
    if (!bounds || !bounds.isValid()) {
      return false;
    }

    return bounds;
  };

  // When the query bounds change, update the params.
  getQueryParams = (bounds) => {
    const {state} = this.props;
    const {areaSearchRangeMinutes = 60, isLiveAndCurrent, time, date} = state;

    if (!bounds || (typeof bounds.isValid === "function" && !bounds.isValid())) {
      return {};
    }

    // Constrain search time span to 1 minute when auto-polling.
    const timespan = isLiveAndCurrent ? 1 : areaSearchRangeMinutes;

    const moment = getMomentFromDateTime(date, time, TIMEZONE);

    const min = moment.clone().subtract(Math.round(timespan / 2), "minutes");
    const max = moment.clone().add(Math.round(timespan / 2), "minutes");

    // Translate the bounding box to a min/max query for the HFP api and create a time range.
    return {
      minTime: min,
      maxTime: max,
      minLong: bounds.getWest(),
      maxLong: bounds.getEast(),
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
    };
  };

  componentDidMount() {
    this.disposeResetListener = setResetListener(() => this.setQueryBounds(null));
  }

  componentWillUnmount() {
    this.disposeResetListener();
  }

  render() {
    const {
      children,
      date,
      skip,
      state: {isLiveAndCurrent},
    } = this.props;

    const currentBounds = this.queryBounds;
    const bounds = this.getBoundsForQuery(currentBounds, isLiveAndCurrent);

    return (
      <AreaHfpQuery
        skip={skip} // Skip query if some params are falsy
        date={date}
        getQueryParams={() => this.getQueryParams(bounds)}>
        {({events, loading, error}) =>
          children({
            setQueryBounds: this.setQueryBounds,
            actualQueryBounds: bounds && !bounds.equals(currentBounds) ? bounds : false,
            events,
            loading,
            error,
          })
        }
      </AreaHfpQuery>
    );
  }
}

export default AreaHfpEvents;
