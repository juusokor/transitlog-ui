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
  border: 1px solid var(--lighter-grey);
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
`;

const TabButton = styled.button`
  background-color: white;
  border: 1px solid var(--lighter-grey);
  padding: 0.5rem;
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: stretch;
`;

const TabButtonContent = styled.div`
  flex: 1 1 auto;
  flex-direction: row;
  margin-left: 1.625rem;
  margin-right: 1.625rem;
  margin-bottom: 1rem;
  padding-top: 1.25rem;
  justify-content: center;
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
    const {selectedTab} = this.state;

    let selectedTabContent = null;

    const tabs = Children.map(children, (tabContent) => {
      if (!React.isValidElement(tabContent)) {
        return null;
      }

      const {name, label} = tabContent.props;

      if (name === selectedTab) {
        selectedTabContent = tabContent;
      }

      return {name, label};
    });

    return (
      <TabsWrapper className={className}>
        <TabButtonsWrapper>
          {tabs.map((tabOption) => (
            <TabButton
              selected={selectedTab === tabOption.name}
              onClick={this.onTabClick(tabOption.name)}>
              <TabButtonContent>{tabOption.label}</TabButtonContent>
            </TabButton>
          ))}
        </TabButtonsWrapper>
        <TabContentWrapper>{selectedTabContent}</TabContentWrapper>
      </TabsWrapper>
    );
  }
}

export default Tabs;
