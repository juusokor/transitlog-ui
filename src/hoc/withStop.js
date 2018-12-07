import React from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import SingleStopQuery from "../queries/SingleStopQuery";

export default (fetchArgs = {}) => (Component) =>
  observer((props) => {
    const {fetchRouteSegments = false} = fetchArgs;

    // Get the stop id from the immediate props or from state.
    const stopId = get(props, "stop", get(props, "state.stop", ""));
    const date = get(props, "date", get(props, "state.date"));

    return (
      <SingleStopQuery
        stop={stopId}
        date={date}
        fetchRouteSegments={fetchRouteSegments}>
        {({stop, loading}) => (
          <Component {...props} stop={stop} loading={loading || props.loading} />
        )}
      </SingleStopQuery>
    );
  });
