import React, {Component, Children} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";
import compact from "lodash/compact";

const TabsWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
`;

const TabButtonsWrapper = styled.div`
  background-color: white;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
`;

const TabButton = styled.button`
  font-family: inherit;
  font-size: 0.875rem;
  text-transform: uppercase;
  background-color: ${({selected}) => (selected ? "white" : "var(--lightest-grey)")};
  border: 1px solid var(--alt-grey);
  border-left: 0;
  border-bottom-color: ${({selected}) =>
    selected ? "transparent" : "var(--lighter-grey)"};
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: 0;
  padding: 1rem 0.5rem;

  &:last-child {
    border-right: 0;
  }

  &:only-child {
    padding-bottom: 0.5rem;
  }
`;

const TabContentWrapper = styled.div`
  background: white;
  height: 100%;
`;

@observer
class Tabs extends Component {
  state = {
    selectedTab: "",
  };

  onTabClick = (selectName) => () => {
    this.setState({
      selectedTab: selectName,
    });
  };

  render() {
    const {children, className} = this.props;
    let {selectedTab} = this.state;

    // The tab content to render
    let selectedTabContent = null;

    // The children usually contain an empty string as the first element.
    // Compact() removes all falsy values from the array.
    const validChildren = compact(Children.toArray(children));

    const tabs = validChildren.map((tabContent, idx, allChildren) => {
      if (!tabContent || !React.isValidElement(tabContent)) {
        return null;
      }

      const {name, label} = tabContent.props;

      // If there is only one tab, select it right off
      if (
        !selectedTab &&
        (allChildren.length === 1 || (idx === 0 && !selectedTab))
      ) {
        selectedTab = name;
      }

      // Set the current tab content to the selected tab
      if (name === selectedTab) {
        selectedTabContent = tabContent;
      }

      return {name, label};
    });

    return (
      <TabsWrapper className={className}>
        <TabButtonsWrapper>
          {compact(tabs).map((tabOption, index) => (
            <TabButton
              key={`tab_${tabOption.name}_${index}`}
              selected={selectedTab === tabOption.name}
              onClick={this.onTabClick(tabOption.name)}>
              {tabOption.label}
            </TabButton>
          ))}
        </TabButtonsWrapper>
        <TabContentWrapper>{selectedTabContent}</TabContentWrapper>
      </TabsWrapper>
    );
  }
}

export default Tabs;
