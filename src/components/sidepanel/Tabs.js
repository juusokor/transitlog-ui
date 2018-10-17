import React, {Component, Children} from "react";
import {observer} from "mobx-react";
import styled from "styled-components";

const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
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
  display: flex;
  flex-direction: column;
  background: white;
  align-items: stretch;
  height: 100%;
`;

@observer
class Tabs extends Component {
  state = {
    selectedTab: "",
  };

  onTabClick = (selectName) => (e) => {
    this.setState({
      selectedTab: selectName,
    });
  };

  render() {
    const {children, className} = this.props;
    let {selectedTab} = this.state;

    let selectedTabContent = null;

    const tabs = Children.map(children, (tabContent, idx) => {
      if (!React.isValidElement(tabContent)) {
        return null;
      }

      const {name, label} = tabContent.props;

      if (idx === 0 && !selectedTab) {
        selectedTab = name;
      }

      if (name === selectedTab) {
        selectedTabContent = tabContent;
      }

      return {name, label};
    });

    return (
      <TabsWrapper className={className}>
        <TabButtonsWrapper>
          {tabs.map((tabOption, index) => (
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
