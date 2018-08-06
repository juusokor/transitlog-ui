import React from "react";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import {observer} from "mobx-react";
import get from "lodash/get";

export default (Component) =>
  observer((props) => {
    // Get the route id from the immediate props or from state.
    const routeId = get(props, "route", get(props, "state.route", ""));

    return (
      <SingleRouteQuery route={routeId}>
        {({route}) => <Component {...props} route={route} />}
      </SingleRouteQuery>
    );
  });
