import React from "react";
import {observer, inject} from "mobx-react";
import flow from "lodash/flow";
import get from "lodash/get";
import SingleStopQuery from "../queries/SingleStopQuery";
import {app} from "mobx-app";

const decorate = flow(
  observer,
  inject(app("state"))
);

export default (Component) =>
  decorate((props) => {
    const {stop: stopProp, date: dateProp, state} = props;

    const stopFromProps = stopProp || state.stop;
    const stopId = get(stopFromProps, "stopId", stopFromProps);

    const date = dateProp || state.date;

    return (
      <SingleStopQuery skip={!stopId || !date} stop={stopId} date={date}>
        {({stop, loading}) => {
          return (
            <Component {...props} stop={stop} loading={loading || props.loading} />
          );
        }}
      </SingleStopQuery>
    );
  });
