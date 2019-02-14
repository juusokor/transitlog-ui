import React, {Component} from "react";
import {observer} from "mobx-react";
import styled, {css} from "styled-components";
import Loading from "../Loading";
import {List, AutoSizer} from "react-virtualized";

const ListWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: ${({hasHeader}) => (hasHeader ? "auto 1fr" : "1fr")};
`;

const ListHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  font-size: 0.9em;
  border-bottom: 1px solid var(--alt-grey);
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.075);
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
class VirtualizedSidepanelList extends Component {
  render() {
    const {
      header,
      date,
      list = [],
      renderRow,
      loading = false,
      rowHeight,
      scrollToIndex,
      updatedAt,
    } = this.props;

    return (
      <ListWrapper hasHeader={!!header}>
        {header && <ListHeader>{header}</ListHeader>}
        <div>
          <AutoSizer>
            {({height, width}) => (
              <List
                updatedAt={updatedAt}
                date={date}
                scrollToIndex={scrollToIndex}
                estimatedRowSize={35}
                height={height}
                width={width}
                rowCount={list.length}
                rowHeight={rowHeight}
                rowRenderer={renderRow}
              />
            )}
          </AutoSizer>
        </div>
        <LoadingContainer loading={loading}>
          <Loading />
        </LoadingContainer>
      </ListWrapper>
    );
  }
}

export default VirtualizedSidepanelList;
