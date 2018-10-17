import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import Journeys from "./Journeys";
import styled, {css} from "styled-components";
import Loading from "../Loading";
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
      state: {stop, date},
    } = this.props;

    return (
      <SidePanelContainer>
        <LoadingContainer loading={loading}>
          <Loading />
        </LoadingContainer>
        <Tabs>
          <Journeys name="journeys" label="Journeys" />
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
