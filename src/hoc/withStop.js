import React from "react";
import {observer} from "mobx-react";
import get from "lodash/get";
import SingleStopQuery from "../queries/SingleStopQuery";

export default (Component) =>
  observer((props) => {
    // Get the stop id from the immediate props or from state.
    const stopId = get(props, "stop", get(props, "state.stop", ""));

    // The stop parameter might already be the full object. In that case,
    // just render the component without doing a query.
    if (!stopId || typeof stopId !== "string") {
      return <Component {...props} />;
    }

    return (
      <SingleStopQuery stop={stopId}>
        {({stop}) => <Component {...props} stop={stop} />}
      </SingleStopQuery>
    );
  });
