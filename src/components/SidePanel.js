import React, {Component} from "react";
import {observer} from "mobx-react";
import JourneyList from "./JourneyList";
import styled, {css} from "styled-components";
import Loading from "./Loading";
import Header from "./filterbar/Header";

const SidePanelContainer = styled.div`
  background: var(--lightest-grey);
  color: var(--dark-grey);
  transition: transform 0.3s ease-out;
  transform: translateX(${({visible = true}) => (visible ? 0 : "calc(-100%)")});
  border-right: 1px solid var(--alt-grey);
  grid-row: 1 / span 2;
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: -0.5rem;
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

  ${({loading = false}) =>
    loading
      ? css`
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        `
      : ""};
`;

const JourneyListWrapper = styled.div`
  position: relative;
  padding-top: 1rem;
`;

@observer
class SidePanel extends Component {
  render() {
    const {loading} = this.props;

    return (
      <SidePanelContainer>
        <Header />
        <JourneyListWrapper>
          <LoadingContainer loading={loading}>
            <Loading />
          </LoadingContainer>
          <JourneyList />
        </JourneyListWrapper>
      </SidePanelContainer>
    );
  }
}

export default SidePanel;
