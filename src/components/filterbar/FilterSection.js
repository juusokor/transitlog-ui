import React, {Component} from "react";
import {observer} from "mobx-react";
import styled, {css} from "styled-components";
import RoundButton from "../RoundButton";
import PlusIcon from "../../icons/Plus";
import MinusIcon from "../../icons/Minus";

const SectionVisible = styled.div`
  height: 100%;
  width: 100%;
  padding: 0.75rem 1rem 0;

  ${({expandable = false}) =>
    expandable
      ? css`
          display: flex;
          align-items: flex-start;
        `
      : ""};
`;

const VisibleContainer = styled.div`
  flex: 1 1 auto;
`;

const SectionExpandable = styled.div`
  width: ${({expanded = false}) => (expanded ? "100%" : "0%")};
  opacity: ${({expanded = false}) => (expanded ? 1 : 0)};
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  top: 0;
  bottom: 0;
  left: 100%;
  z-index: 50;
  transform: translateX(0);
  background: var(--lightest-grey);
  box-shadow: 2px 0 5px 0 rgba(0, 0, 0, 0.1);
  margin-left: -1px;
  border-right: 1px solid var(--lighter-grey);
  border-left: 1px solid var(--lighter-grey);
  border-bottom: 1px solid var(--lighter-grey);
  transition: width 0.2s ease-out, opacity 0.2s ease-out;
  padding: 0.75rem 1rem 1rem;
`;

const FilterSectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  border-right: 1px solid var(--lighter-grey);
  background: var(--lightest-grey);
`;

const ExpandToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin-right: -0.5rem;
  margin-left: 0.75rem;
  margin-top: -0.25rem;
`;

@observer
class FilterSection extends Component {
  state = {
    expanded: false,
  };

  toggleExpanded = (e) => {
    e.preventDefault();

    this.setState({
      expanded: !this.state.expanded,
    });
  };

  render() {
    const {className, children, expandable} = this.props;
    const {expanded} = this.state;

    return (
      <FilterSectionWrapper
        isExpandable={!!expandable}
        expanded={expanded}
        className={className}>
        {expandable && (
          <SectionExpandable expanded={expanded}>{expandable}</SectionExpandable>
        )}
        <SectionVisible expandable={!!expandable}>
          <VisibleContainer>{children}</VisibleContainer>
          {expandable && (
            <ExpandToggle>
              <RoundButton onClick={this.toggleExpanded}>
                {expanded ? (
                  <MinusIcon width={7.5} height={7.5} fill="var(--blue)" />
                ) : (
                  <PlusIcon width={7.5} height={7.5} fill="var(--blue)" />
                )}
              </RoundButton>
            </ExpandToggle>
          )}
        </SectionVisible>
      </FilterSectionWrapper>
    );
  }
}

export default FilterSection;
