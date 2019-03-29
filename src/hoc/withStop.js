import React from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import SingleStopQuery from "../queries/SingleStopQuery";

export const withStop = (Component) =>
  observer((props) => (
    <SingleStopQuery
      stopId={get(props, "stopId", get(props, "state.stop"))}
      date={get(props, "date", get(props, "state.date"))}>
      {({stop, loading}) => <Component {...props} stop={stop} stopLoading={loading} />}
    </SingleStopQuery>
  ));
