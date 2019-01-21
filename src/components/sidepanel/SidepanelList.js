import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import styled, {css} from "styled-components";
import Loading from "../Loading";
import {action, observable, reaction} from "mobx";
import {app} from "mobx-app";

const ListWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: ${({hasHeader}) => (hasHeader ? "auto 1fr" : "1fr")};
`;

const ListRows = styled.div`
  position: relative;
  overflow-y: auto;
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

// Needs an absolutely positioned container for scrollbars to work in Chrome...
const ScrollContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
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

@inject(app("state"))
@observer
class SidepanelList extends Component {
  scrollElementRef = React.createRef();
  scrollPositionRef = React.createRef();

  disposeScrollOffsetReaction = () => {};

  @observable
  scrollOffset = 0;

  listHeight = 0;

  updateScrollOffsetTimer = 0;

  scrollTo = (offset) => {
    if (this.scrollElementRef.current) {
      this.scrollElementRef.current.scrollTop = offset - this.listHeight / 2;
    }
  };

  componentDidMount() {
    this.disposeScrollOffsetReaction = reaction(
      () => this.scrollOffset,
      (offset) => {
        if (!this.props.loading) {
          this.scrollTo(offset);
        }
      }
    );

    if (this.scrollElementRef.current) {
      this.listHeight = this.scrollElementRef.current.getBoundingClientRect().height;
    }
  }

  componentWillUnmount() {
    this.disposeScrollOffsetReaction();
  }

  async componentDidUpdate() {
    let {reset, loading} = this.props;

    if (!loading) {
      if (this.updateScrollOffsetTimer) {
        clearTimeout(this.updateScrollOffsetTimer);
      }

      this.updateScrollOffsetTimer = setTimeout(
        () => this.updateScrollOffset(reset),
        500
      );
    }
  }

  updateScrollOffset = (reset = false) => {
    const offset = this.getScrollOffset(reset);

    if (!this.scrollOffset || offset !== this.scrollOffset) {
      this.setScrollOffset(offset);
    }
  };

  // This method only gets a new position if the scrollOffset has not previously been set.
  // This behaviour can be overridden by setting the reset arg to true.
  getScrollOffset = (reset = false) => {
    if (this.scrollPositionRef.current && (!this.scrollOffset || reset)) {
      let offset = this.scrollPositionRef.current.offsetTop;

      if (offset) {
        return offset;
      }
    }

    return this.scrollOffset;
  };

  setScrollOffset = action((offset) => {
    this.scrollOffset = offset;
  });

  render() {
    const {
      state: {live},
      header,
      children = () => {},
      loading = false,
    } = this.props;

    return (
      <ListWrapper hasHeader={!!header}>
        {header && <ListHeader>{header}</ListHeader>}
        <ListRows ref={this.scrollElementRef}>
          <ScrollContainer>
            {children(this.scrollPositionRef, this.updateScrollOffset)}
          </ScrollContainer>
        </ListRows>
        {!live && (
          <LoadingContainer loading={loading}>
            <Loading />
          </LoadingContainer>
        )}
      </ListWrapper>
    );
  }
}

export default SidepanelList;
