import styled from "styled-components";
import TimingStopIcon from "../../../icon-time1.svg";
import React from "react";
import {TagButton} from "../../TagButton";
import {Heading} from "../../Typography";

export const SmallText = styled.span`
  display: block;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: var(--light-grey);
`;

export const StopMarker = styled.div`
  border-radius: 50%;
  flex: 0 0 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border: 3px solid ${({color = "var(--blue)"}) => color};
`;

const TimingStopMarkerBackground = styled(StopMarker)`
  border: 0;
  width: 2rem;
  height: 2rem;
  margin-top: -0.3rem;
`;

const TimingStopMarkerIcon = styled.img.attrs({src: TimingStopIcon})`
  border-radius: 50%;
  width: 100%;
  height: 100%;
  display: block;
`;

export const TimingStopMarker = (props) => (
  <TimingStopMarkerBackground {...props}>
    <TimingStopMarkerIcon />
  </TimingStopMarkerBackground>
);

export const StopElementsWrapper = styled.div`
  display: flex;
  align-self: stretch;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 3px;
  background: ${({color = "var(--blue)"}) => color};
  margin: 0 calc(0.75rem - 1.5px);

  &:after {
    content: "";
    display: ${({terminus}) => (terminus === "destination" ? "block" : "none")};
    height: 3px;
    width: 1.5rem;
    background: ${({color = "var(--blue)"}) => color};
    margin-top: auto;
  }
`;
export const StopWrapper = styled.div`
  padding: 0 1rem 0 0;
  margin-left: 0.75rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;
export const StopContent = styled.div`
  padding: 0 1.25rem 2rem 0.75rem;
  width: 100%;
`;
export const StopHeading = styled(Heading).attrs({level: 5})`
  margin-top: 0.2rem;
  color: var(--dark-grey);
  font-size: 0.875rem;
  font-weight: normal;
`;
export const TimeHeading = styled.div`
  font-size: 0.75rem;
  color: var(--light-grey);
  margin-bottom: 0.2rem;
  margin-top: 1rem;
`;
export const StopArrivalTime = styled(TagButton)`
  margin: 0 0 0.5rem;
`;
export const StopDepartureTime = styled(TagButton)``;
