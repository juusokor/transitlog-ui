import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import Equipment from "./Equipment";
import CalculateTerminalTime from "./CalculateTerminalTime";
import doubleDigit from "../../../helpers/doubleDigit";
import {stopTimes} from "../../../helpers/stopTimes";

const JourneyInfo = styled.div`
  margin-top: 1rem;
`;

const JourneyInfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2rem;
  background: var(--lightest-grey);
  font-size: 1rem;
  font-family: inherit;

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.0075);
  }
`;

const Line = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  line-height: 1.5;
  justify-content: ${({right = false}) => (right ? "flex-end" : "space-between")};
`;

export default ({journey, date, originStopTimes}) => {
  return (
    <JourneyInfo>
      <JourneyInfoRow>
        <Line>
          <span>Terminal time</span>
          <strong>
            {get(originStopTimes.departure.departure, "terminalTime", 3)} min
          </strong>
        </Line>
        <CalculateTerminalTime
          date={date}
          departure={originStopTimes.departure.departure}
          event={originStopTimes.arrival.event}>
          {({diffMinutes, diffSeconds, wasLate}) => (
            <Line>
              <span>Observed terminal time</span>
              <strong style={{color: wasLate ? "var(--red)" : "inherit"}}>
                {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
              </strong>
            </Line>
          )}
        </CalculateTerminalTime>
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <span>Recovery time</span>
          <strong>3 min</strong>
        </Line>
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <span>Equipment required</span>
          <strong>D, teli</strong>
        </Line>
        <Line>
          <span>Equipment observed</span>
          <Equipment journey={journey} />
        </Line>
      </JourneyInfoRow>
    </JourneyInfo>
  );
};
