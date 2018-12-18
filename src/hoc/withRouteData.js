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
          route={pick(route, "routeId", "direction", "dateBegin", "dateEnd")}>
          {({route: fetchedRoute, loading}) => (
            <Component
              {...this.props}
              loading={loading}
              date={date}
              route={fetchedRoute}
            />
          )}
        </SingleRouteQuery>
      );
    }
  }

  return WithRouteComponent;
};
