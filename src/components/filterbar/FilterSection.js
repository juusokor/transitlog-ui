import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";

const SectionContent = styled.div`
  width: 100%;
  padding: 0.75rem 1rem 1rem;
`;

const FilterSectionWrapper = styled.div`
  width: 100%;
  height: 9rem;
  position: relative;
  border-right: 1px solid var(--lighter-grey);
  background: var(--lightest-grey);
  overflow-y: ${({scrollable = false}) => (scrollable ? "auto" : "visible")};
  overflow-x: hidden;
  z-index: 1;
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
