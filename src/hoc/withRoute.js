import React from "react";
import SingleRouteQuery from "../queries/SingleRouteQuery";
import {observer} from "mobx-react";
import get from "lodash/get";

export default (Component) =>
  observer((props) => {
    // Get the route id from the immediate props or from state.
    const route = get(props, "route", get(props, "state.route", ""));

    if (!route.routeId) {
      return <Component {...props} route={{}} />;
    }

    return (
      <SingleRouteQuery route={route}>
        {({route: routeObj}) => <Component {...props} route={routeObj} />}
      </SingleRouteQuery>
    );
  });
