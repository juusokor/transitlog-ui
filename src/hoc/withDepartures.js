import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React, {Component} from "react";
import withRoute from "./withRoute";
import DeparturesQuery from "../queries/DeparturesQuery";

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithDeparturesComponent extends React.Component {
    render() {
      const {
        route,
        stop,
        state: {date},
      } = this.props;

      return (
        <DeparturesQuery route={route} stop={stop} date={date}>
          {({departures = []}) => (
            <Component departures={departures} {...this.props} />
          )}
        </DeparturesQuery>
      );
    }
  }

  return WithDeparturesComponent;
};
