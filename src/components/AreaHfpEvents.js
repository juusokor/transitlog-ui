import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {observable, action, reaction} from "mobx";
import {app} from "mobx-app";
import {combineDateAndTime} from "../helpers/time";
import AreaHfpQuery from "../queries/AreaHfpQuery";

@inject(app("state"))
@observer
class AreaHfpEvents extends Component {
  disposeReaction = () => {};

  @observable
  currentBounds = null;

  @observable
  queryParams = {
    minTime: null,
    maxTime: null,
    minLong: null,
    maxLong: null,
    minLat: null,
    maxLat: null,
  };

  setQueryBounds = action((bounds) => {
    if (!this.currentBounds || !this.currentBounds.equals(bounds)) {
      this.currentBounds = bounds;
    }
  });

  setQueryParams = action((bounds) => {
    const {
      state: {date, time},
    } = this.props;

    const moment = combineDateAndTime(date, time, "Europe/Helsinki");

    this.queryParams = {
      date,
      minTime: moment.clone().subtract(5, "minutes"),
      maxTime: moment.clone().add(5, "minutes"),
      minLong: bounds.getWest(),
      maxLong: bounds.getEast(),
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
    };
  });

  componentDidMount() {
    this.disposeReaction = reaction(() => this.currentBounds, this.setQueryParams);
  }

  componentWillUnmount() {
    this.disposeReaction();
  }

  render() {
    const {children} = this.props;
    const {date, minTime, maxTime, ...area} = this.queryParams;

    return (
      <AreaHfpQuery
        skip={Object.values(this.queryParams).some((p) => !p)} // Skip query if some params are falsy
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
