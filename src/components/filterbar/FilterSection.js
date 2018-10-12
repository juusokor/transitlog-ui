import React, {Component} from "react";
import {observer} from "mobx-react";
import styled, {css} from "styled-components";

const SectionVisible = styled.div`
  height: 100%;
  width: 100%;
  padding: 0.75rem 1rem 1rem;
  position: relative;
  z-index: 30;
`;

const SectionExpandable = styled.div`
  width: calc(100% + 1px);
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 30;
  transform: translateY(100%);
  background: var(--lightest-grey);
  border-right: 1px solid var(--alt-grey);
  border-left: 1px solid var(--alt-grey);
  border-bottom: 1px solid var(--alt-grey);

  > div {
    padding: 1.5rem 1rem 1rem;
  }

  ${({expanded = false}) =>
    expanded
      ? css`
          opacity: 1;
          max-height: none;
        `
      : ""};
`;

const FilterSectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  border-right: 1px solid var(--alt-grey);
`;

@observer
class FilterSection extends Component {
  state = {
    expanded: false,
  };

  onTrigger = (state) => (e) => {
    setTimeout(() => {
      if (this.state.expanded !== state) {
        this.setState({
          expanded: state,
        });
      }
    }, 30);
  };

  render() {
    const {className, children, expandable} = this.props;
    const {expanded} = this.state;

    return (
      <FilterSectionWrapper
        className={className}
        onMouseEnter={this.onTrigger(true)}
        onMouseLeave={this.onTrigger(false)}>
        {expandable && (
          <SectionExpandable expanded={expanded}>
            <div>{expandable}</div>
          </SectionExpandable>
        )}
        <SectionVisible>{children}</SectionVisible>
      </FilterSectionWrapper>
    );
  }
}

export default FilterSection;
