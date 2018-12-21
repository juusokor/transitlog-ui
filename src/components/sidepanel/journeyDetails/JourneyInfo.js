import React from "react";
import styled from "styled-components";
import get from "lodash/get";
import Equipment from "./Equipment";
import CalculateTerminalTime from "./CalculateTerminalTime";
import doubleDigit from "../../../helpers/doubleDigit";

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
  const equipment = <Equipment journey={journey} />;

  return (
    <JourneyInfo>
      {originStopTimes && (
        <>
          <JourneyInfoRow>
            <Line>
              <span>Terminal time</span>
              <span>{get(originStopTimes.departure, "terminalTime", 3)} min</span>
            </Line>
            <Line right>
              <CalculateTerminalTime
                date={date}
                departure={originStopTimes.departure}
                event={originStopTimes.arrivalEvent}>
                {({diffMinutes, diffSeconds, wasLate}) => (
                  <strong style={{color: wasLate ? "var(--red)" : "inherit"}}>
                    {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                  </strong>
                )}
              </CalculateTerminalTime>
            </Line>
          </JourneyInfoRow>
          <JourneyInfoRow>
            <Line>
              <span>Recovery time</span>
              <span>{get(originStopTimes.departure, "recoveryTime", 3)} min</span>
            </Line>
          </JourneyInfoRow>
        </>
      )}
      <JourneyInfoRow>
        <Line>
          <span>Vehicle ID</span>
          <strong>{journey.unique_vehicle_id}</strong>
        </Line>
      </JourneyInfoRow>
      <JourneyInfoRow>
        <Line>
          <span>Equipment required</span>
          <span>
            <span>C, teli</span>
          </span>
        </Line>
        {equipment && (
          <Line right>
            <strong>{equipment}</strong>
          </Line>
        )}
      </JourneyInfoRow>
    </JourneyInfo>
  );
};
