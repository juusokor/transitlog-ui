import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import JourneyList from "./JourneyList";
import styled, {css} from "styled-components";
import Loading from "./Loading";
import {app} from "mobx-app";
import get from "lodash/get";
import StopTimetable from "./map/StopTimetable";

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

const enumContentStates = {
  JOURNEYLIST: "journeylist",
  STOP_TIMETABLES: "timetables",
};

@inject(app("state"))
@observer
class SidePanel extends Component {
  static getDerivedStateFromProps(props, state) {
    const {state: appState} = props;
    const {stop, route} = appState;

    let nextContentState = enumContentStates.JOURNEYLIST;

    if (stop && (!route || !route.routeId)) {
      nextContentState = enumContentStates.STOP_TIMETABLES;
    }

    if (state.content !== nextContentState) {
      return {
        content: nextContentState,
      };
    }

    return null;
  }

  state = {
    content: "journey-list",
  };

  render() {
    const {
      loading,
      state: {stop},
    } = this.props;
    const {content} = this.state;

    const contentComponent =
      content === enumContentStates.STOP_TIMETABLES ? (
        <StopTimetable stopId={stop} />
      ) : (
        <JourneyList />
      );

    return (
      <SidePanelContainer>
        <LoadingContainer loading={loading}>
          <Loading />
        </LoadingContainer>
        {contentComponent}
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
