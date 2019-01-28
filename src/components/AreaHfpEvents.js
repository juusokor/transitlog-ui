import React, {PureComponent} from "react";
import {inject} from "mobx-react";
import {app} from "mobx-app";
import AreaHfpQuery from "../queries/AreaHfpQuery";
import invoke from "lodash/invoke";
import moment from "moment-timezone";
import {getMomentFromDateTime} from "../helpers/time";
import {setResetListener} from "../stores/FilterStore";

@inject(app("state"))
class AreaHfpEvents extends PureComponent {
  disposeResetListener = () => {};

  state = {
    bounds: null,
  };

  setQueryBounds = (bounds) => {
    this.setState((state) => {
      const current = state.bounds;

      if (!bounds || !invoke(bounds, "isValid")) {
        return {
          bounds: null,
        };
      }

      if (!current || (current && current.isValid() && !current.equals(bounds))) {
        return {
          bounds,
        };
      }

      return {
        bounds: current,
      };
    });
  };

  // When the query bounds change, update the params.
  getQueryParams = (bounds) => {
    const {state} = this.props;

    if (!bounds || (typeof bounds.isValid === "function" && !bounds.isValid())) {
      return {};
    }

    const {areaSearchRangeMinutes = 10, live, timeIsCurrent, time, date} = state;

    // Constrain search time span to 5 minutes when auto-polling.
    const timespan = live && timeIsCurrent ? 5 : areaSearchRangeMinutes;

    const moment = getMomentFromDateTime(date, time, "Europe/Helsinki");

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
    this.disposeResetListener = setResetListener(() =>
      this.setState({bounds: null})
    );
  }

  componentWillUnmount() {
    this.disposeResetListener();
  }

  render() {
    const {children, date, defaultBounds, skip} = this.props;
    const {bounds} = this.state;

    const useBounds =
      bounds || (defaultBounds ? defaultBounds.getCenter().toBounds(1000) : null);

    const queryParams = this.getQueryParams(useBounds);
    const {minTime, maxTime, ...area} = queryParams;

    return (
      <AreaHfpQuery
        skip={
          skip ||
          Object.keys(queryParams).length === 0 ||
          Object.values(queryParams).some((p) => !p)
        } // Skip query if some params are falsy
        date={date}
        minTime={minTime ? minTime.toISOString() : null}
        maxTime={maxTime ? maxTime.toISOString() : null}
        getQueryParams={() => this.getQueryParams(useBounds)}
        area={area}>
        {({events, loading, error, variables: {minTime, maxTime}}) =>
          children({
            queryBounds: this.setQueryBounds,
            events,
            loading,
            error,
            timeRange: minTime
              ? {
                  min: moment.tz(minTime, "Europe/Helsinki"),
                  max: moment.tz(maxTime, "Europe/Helsinki"),
                }
              : null,
          })
        }
      </AreaHfpQuery>
    );
  }
}

export default AreaHfpEvents;
