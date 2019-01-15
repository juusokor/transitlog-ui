import React, {PureComponent} from "react";
import {inject} from "mobx-react";
import {app} from "mobx-app";
import {combineDateAndTime} from "../helpers/time";
import AreaHfpQuery from "../queries/AreaHfpQuery";
import invoke from "lodash/invoke";
import moment from "moment-timezone";

@inject(app("state"))
class AreaHfpEvents extends PureComponent {
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
  getQueryParams = (bounds, date) => {
    const {
      state: {time, areaSearchRangeMinutes = 60, pollingEnabled},
    } = this.props;

    if (!bounds || (typeof bounds.isValid === "function" && !bounds.isValid())) {
      return {};
    }

    // Constrain search time span to 10 minutes when auto-polling.
    // Since future data doesn't exist, this effectively means
    // searching 5 minutes into the past.
    const timespan = pollingEnabled ? 10 : areaSearchRangeMinutes;
    const moment = combineDateAndTime(date, time, "Europe/Helsinki");

    const minTime = moment.clone().subtract(Math.round(timespan / 2), "minutes");
    const maxTime = moment.clone().add(Math.round(timespan / 2), "minutes");

    // Translate the bounding box to a min/max query for the HFP api and create a time range.
    return {
      minTime,
      maxTime,
      minLong: bounds.getWest(),
      maxLong: bounds.getEast(),
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
    };
  };

  render() {
    const {children, date, defaultBounds, skip} = this.props;
    const {bounds} = this.state;

    console.log(date);

    const useBounds =
      bounds || (defaultBounds ? defaultBounds.getCenter().toBounds(1000) : null);

    const queryParams = this.getQueryParams(useBounds, date);
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
        getQueryParams={() => this.getQueryParams(useBounds, date)}
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
