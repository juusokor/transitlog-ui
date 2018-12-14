import React from "react";
import {Heading} from "../Typography";
import Cross from "../../icons/Cross";
import styled from "styled-components";
import {observer} from "mobx-react";

const JourneyPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-left: 1rem;

  h4 {
    margin-top: 0.75rem;
  }
`;

const JourneyPanelCloseButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  transition: background 0.1s ease-out, transform 0.1s ease-out;
  cursor: pointer;
  margin-left: auto;
  margin-right: 1px;
  margin-top: 1px;
  outline: 0;

  svg {
    transition: color 0.1s ease-out;
  }

  &:hover {
    background: var(--lightest-grey);
    transform: scale(1.05);

    svg {
      fill: white;
    }
  }
`;

const JourneyPanelContent = styled.div`
  padding: 1rem;
`;

@observer
class JourneyDetails extends React.Component {
  render() {
    const {onToggle} = this.props;

    return (
      <>
        <JourneyPanelHeader>
          <Heading level={4}>Journey</Heading>
          <JourneyPanelCloseButton onClick={() => onToggle()}>
            <Cross fill="var(--blue)" width="1.25rem" height="1.25rem" />
          </JourneyPanelCloseButton>
        </JourneyPanelHeader>
        <JourneyPanelContent>Journey data here</JourneyPanelContent>
      </>
    );
  }
}

export default JourneyDetails;
