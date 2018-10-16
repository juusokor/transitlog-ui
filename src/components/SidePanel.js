import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import JourneyList from "./JourneyList";
import styled, {css} from "styled-components";
import Loading from "./Loading";
import Header from "./filterbar/Header";
import {app} from "mobx-app";
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

const ContentWrapper = styled.div`
  height: calc(100% - (9rem + 3px)); // Subtract header height
  position: relative;
  width: ${({wide = false}) => (wide ? "200%" : "100%")};
  position: relative;
  z-index: 1;
`;

@inject(app("state"))
@observer
class SidePanel extends Component {
  render() {
    const {loading, state} = this.props;
    const {stop, route} = state;

    const showStopTimetables = stop && !route.routeId;

    const content = showStopTimetables ? (
      <StopTimetable stopId={stop} />
    ) : (
      <JourneyList />
    );

    return (
      <SidePanelContainer>
        <ContentWrapper wide={showStopTimetables}>
          <LoadingContainer loading={loading}>
            <Loading />
          </LoadingContainer>
          {content}
        </ContentWrapper>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
