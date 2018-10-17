import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import JourneyList from "./JourneyList";
import styled, {css} from "styled-components";
import Loading from "./Loading";
import {app} from "mobx-app";
import StopTimetable from "./map/StopTimetable";
import Tabs from "./Tabs";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  transition: transform 0.3s ease-out;
  transform: translateX(${({visible = true}) => (visible ? 0 : "calc(-100%)")});
  border-right: 1px solid var(--alt-grey);
  grid-row: 2;
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 2rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.1s ease-out, transform 0.2s ease-out;
  transform: translateY(-5rem);
  z-index: 10;

  ${({loading = false}) =>
    loading
      ? css`
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        `
      : ""};
`;

@inject(app("state"))
@observer
class SidePanel extends Component {
  render() {
    const {
      loading,
      state: {stop},
    } = this.props;

    return (
      <SidePanelContainer>
        <LoadingContainer loading={loading}>
          <Loading />
        </LoadingContainer>
        <Tabs>
          <JourneyList name="journeys" label="Journeys" />
          <StopTimetable stopId={stop} name="timetables" label={`Stop timetables`} />
        </Tabs>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
