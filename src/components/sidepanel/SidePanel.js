import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import Journeys from "./Journeys";
import styled from "styled-components";
import {app} from "mobx-app";
import Tabs from "./Tabs";
import Timetables from "./Timetables";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  transition: transform 0.3s ease-out;
  transform: translateX(${({visible = true}) => (visible ? 0 : "calc(-100%)")});
  border-right: 1px solid var(--alt-grey);
  grid-row: 2;
  padding-top: 3px;
`;

@inject(app("state"))
@observer
class SidePanel extends Component {
  render() {
    const {
      positions,
      loading,
      state: {
        stop,
        date,
        route: {routeId = ""},
      },
    } = this.props;

    return (
      <SidePanelContainer>
        <Tabs>
          {routeId && (
            <Journeys
              positions={positions}
              loading={loading}
              name="journeys"
              label="Journeys"
            />
          )}
          {stop && (
            <Timetables
              date={date} // Needed for withStop to fetch routeSegments
              stop={stop}
              name="timetables"
              label={`Stop timetables`}
            />
          )}
        </Tabs>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
