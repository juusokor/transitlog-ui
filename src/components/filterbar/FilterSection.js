import React, {Component} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";

const SectionContent = styled.div`
  width: 100%;
  padding: 0.75rem 1rem 1rem;
  position: absolute;
  top: 0;
  left: 0;
`;

const FilterSectionWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border-right: 1px solid var(--lighter-grey);
  background: var(--lightest-grey);
  overflow-y: auto;
  overflow-x: hidden;
`;

@observer
class FilterSection extends Component {
  render() {
    const {className, children} = this.props;

    return (
      <FilterSectionWrapper className={className}>
        <SectionContent>{children}</SectionContent>
      </FilterSectionWrapper>
    );
  }
}

export default FilterSection;
