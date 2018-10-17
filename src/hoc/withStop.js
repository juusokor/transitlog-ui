import React from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import SingleStopQuery from "../queries/SingleStopQuery";

export default (Component) =>
  observer((props) => {
    // Get the stop id from the immediate props or from state.
    const stopId = get(props, "stop", get(props, "state.stop", ""));
    const date = get(props, "date", get(props, "state.date"));

    return (
      <SingleStopQuery stop={stopId} date={date}>
        {({stop}) => <Component {...props} stop={stop} />}
      </SingleStopQuery>
    );
  });
