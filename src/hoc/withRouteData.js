import React from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import pick from "lodash/pick";
import SingleRouteQuery from "../queries/SingleRouteQuery";

export default (Component) => {
  @inject(app("state"))
  @observer
  class WithRouteComponent extends React.Component {
    render() {
      const {
        state: {route: stateRoute, date: stateDate},
        date = stateDate,
        route = stateRoute,
      } = this.props;

      return (
        <SingleRouteQuery
          date={date}
          extensive={true}
          route={pick(route, "routeId", "direction")}>
          {({route: fetchedRoute}) => (
            <Component {...this.props} date={date} route={fetchedRoute} />
          )}
        </SingleRouteQuery>
      );
    }
  }

  return WithRouteComponent;
};
