import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";

const SectionContent = styled.div`
  width: 100%;
  padding: 0.75rem 1rem 1rem;
`;

const FilterSectionWrapper = styled.div`
  width: 100%;
  height: 8.25rem;
  border-right: 1px solid var(--lighter-grey);
  background: var(--lightest-grey);
  position: relative;
  ${({scrollable = false}) =>
    scrollable ? `overflow-y: auto; overflow-x: hidden;` : "overflow: visible;"};
`;

@observer
class FilterSection extends Component {
  render() {
    const {className, children, scrollable} = this.props;

    return (
      <FilterSectionWrapper scrollable={scrollable} className={className}>
        <SectionContent>{children}</SectionContent>
      </FilterSectionWrapper>
    );
  }
}

export default FilterSection;
