import React from "react";
import {observer} from "mobx-react";
import get from "lodash/get";

export default (Component) =>
  observer((props) => {
    // Get the route id from the immediate props or from state.
    const route = get(props, "route", get(props, "state.route", ""));

    // The route parameter might already be the full object. In that case,
    // just render the component without doing a query. The route prop
    // should also never come through as a string, so take care of that too.

    if (route.routeId) {
      return <Component {...props} route={route} />;
    }

    return <Component {...props} route={{}} />;
  });
