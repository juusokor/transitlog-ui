import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import DeparturesQuery from "../queries/DeparturesQuery";
import withStop from "./withStop";

export default (Component) => {
  @inject(app("state"))
  @observer
  class WithAllStopDeparturesComponent extends React.Component {
    render() {
      const {
        stop,
        state: {date},
        loading,
      } = this.props;

      return (
        <DeparturesQuery stop={stop} date={date}>
          {({departures = [], loading: departuresLoading}) => (
            <Component
              {...this.props}
              departures={departures}
              loading={departuresLoading || loading}
            />
          )}
        </DeparturesQuery>
      );
    }
  }

  return WithAllStopDeparturesComponent;
};
