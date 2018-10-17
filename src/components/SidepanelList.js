import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";

const ListWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-gap: 0;
  grid-template-rows: auto 1fr;
  align-items: stretch;
  justify-content: stretch;
`;

const ListRows = styled.div`
  overflow-y: scroll;
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

@observer
class SidepanelList extends Component {
  render() {
    const {header, children} = this.props;

    return (
      <ListWrapper>
        <ListHeader>{header}</ListHeader>
        <ListRows>{children}</ListRows>
      </ListWrapper>
    );
  }
}

export default SidepanelList;
