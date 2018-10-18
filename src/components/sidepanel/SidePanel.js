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
  position: relative;
`;

// Needs an absolutely positioned container for scrollbars to work in Chrome...
const SidePanelContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
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
        <SidePanelContent>
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
        </SidePanelContent>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
