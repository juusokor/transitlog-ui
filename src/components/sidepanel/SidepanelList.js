import React, {Component} from "react";
import {observer} from "mobx-react";
import styled, {css} from "styled-components";
import Loading from "../Loading";

const ListWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
`;

const ListRows = styled.div`
  overflow-y: auto;
`;

const ListHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  font-size: 0.9em;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.075);
  position: relative;
  z-index: 1;
  line-height: 1.4;
  flex-wrap: nowrap;
  align-items: start;
  padding: 0.75rem 1rem;
  color: var(--grey);
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 8rem;
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

@observer
class SidepanelList extends Component {
  render() {
    const {header, children, loading = false} = this.props;

    return (
      <ListWrapper>
        {header && <ListHeader>{header}</ListHeader>}
        <ListRows>{children}</ListRows>
        <LoadingContainer loading={loading}>
          <Loading />
        </LoadingContainer>
      </ListWrapper>
    );
  }
}

export default SidepanelList;
