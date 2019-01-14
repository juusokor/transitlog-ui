import React, {Component} from "react";
import {inject} from "mobx-react";
import {app} from "mobx-app";
import {combineDateAndTime} from "../helpers/time";
import AreaHfpQuery from "../queries/AreaHfpQuery";

@inject(app("state"))
class AreaHfpEvents extends Component {
  state = {
    bounds: null,
  };

  setQueryBounds = (bounds) => {
    this.setState((state) => {
      const current = state.bounds;
      if (
        !current ||
        (current &&
          bounds &&
          bounds.isValid() &&
          current.isValid() &&
          !current.equals(bounds))
      ) {
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
      state: {time, areaSearchRangeMinutes = 60},
    } = this.props;

    if (!bounds || (typeof bounds.isValid === "function" && !bounds.isValid())) {
      return {};
    }

    const moment = combineDateAndTime(date, time, "Europe/Helsinki");

    const minTime = moment.clone().subtract(areaSearchRangeMinutes / 2, "minutes");
    const maxTime = moment.clone().add(areaSearchRangeMinutes / 2, "minutes");

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
    const {children, date, defaultBounds} = this.props;
    const {bounds} = this.state;

    const useBounds =
      bounds || (defaultBounds ? defaultBounds.getCenter().toBounds(1000) : null);

    const queryParams = this.getQueryParams(useBounds, date);
    const {minTime, maxTime, ...area} = queryParams;

    return (
      <AreaHfpQuery
        skip={
          Object.keys(queryParams).length === 0 ||
          Object.values(queryParams).some((p) => !p)
        } // Skip query if some params are falsy
        date={date}
        minTime={minTime ? minTime.toISOString() : null}
        maxTime={maxTime ? maxTime.toISOString() : null}
        area={area}>
        {({events, loading, error}) => {
          return children({
            queryBounds: this.setQueryBounds,
            events,
            loading,
            error,
            timeRange: minTime
              ? {
                  min: minTime,
                  max: maxTime,
                }
              : null,
          });
        }}
      </AreaHfpQuery>
    );
  }
}

export default AreaHfpEvents;
