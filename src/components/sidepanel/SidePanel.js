import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import Journeys from "./Journeys";
import styled from "styled-components";
import {app} from "mobx-app";
import Tabs from "./Tabs";
import TimetablePanel from "./TimetablePanel";
import VehicleJourneys from "./VehicleJourneys";
import {text} from "../../helpers/text";
import AreaJourneyList from "./AreaJourneyList";
import ArrowLeft from "../../icons/ArrowLeft";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  transition: transform 0.3s ease-out;
  transform: translateX(${({visible = true}) => (visible ? 0 : "calc(-100%)")});
  border-right: 1px solid var(--alt-grey);
  height: 100%;
  width: 25rem;
  position: relative;
  z-index: 1;
`;

const ToggleSidePanelButton = styled.button`
  background: var(--blue);
  border: 0;
  outline: 0;
  width: 1.5rem;
  height: 3rem;
  position: absolute;
  right: -1.5rem;
  top: 50%;
  transform: translateY(-50%);
`;

@inject(app("state"))
@observer
class SidePanel extends Component {
  render() {
    const {
      positions,
      loading,
      state: {stop, route, vehicle},
    } = this.props;

    return (
      <SidePanelContainer>
        <Tabs>
          {(!route || !route.routeId) && positions.length !== 0 && (
            <AreaJourneyList
              journeys={positions}
              name="area-journeys"
              label={text("sidepanel.tabs.area_events")}
            />
          )}
          {!!route && !!route.routeId && (
            <Journeys
              route={route}
              positions={positions}
              loading={loading}
              name="journeys"
              label={text("sidepanel.tabs.journeys")}
            />
          )}
          {vehicle && (
            <VehicleJourneys
              loading={loading}
              name="vehicle-journeys"
              label={text("sidepanel.tabs.vehicle_journeys")}
            />
          )}
          {stop && (
            <TimetablePanel
              loading={loading}
              name="timetables"
              label={text("sidepanel.tabs.timetables")}
            />
          )}
        </Tabs>
        <ToggleSidePanelButton>
          <ArrowLeft />
        </ToggleSidePanelButton>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
