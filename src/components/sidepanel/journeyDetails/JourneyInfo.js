import React from "react";
import styled from "styled-components";

const JourneyInfo = styled.div`
  margin-top: 1rem;
`;

const JourneyInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2rem;
  background: var(--lightest-grey);
  font-size: 1rem;
  font-family: inherit;

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.0075);
  }
`;

export default (props) => (
  <JourneyInfo>
    <JourneyInfoRow>
      <span>Terminal time</span>
      <strong>3 min</strong>
    </JourneyInfoRow>
    <JourneyInfoRow>
      <span>Recovery time</span>
      <strong>3 min</strong>
    </JourneyInfoRow>
    <JourneyInfoRow>
      <span>Equipment requirement</span>
      <strong>D, teli</strong>
    </JourneyInfoRow>
  </JourneyInfo>
);
