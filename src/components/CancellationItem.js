import React from "react";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import styled from "styled-components";
import {Heading} from "./Typography";
import ToggleView from "./ToggleView";
import {observer} from "mobx-react-lite";
import TrashCan from "../icons/TrashCan";
import {text} from "../helpers/text";
import Checkmark from "../icons/Checkmark";
import format from "date-fns/format";

const CancellationComponent = styled.div`
  font-family: var(--font-family);
  background: transparent;
  color: var(--dark-grey);

  &:first-child {
    margin-top: 0;
  }

  &:nth-child(odd) {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const CancellationHeader = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;

  svg {
    display: block;
    margin-right: 0.75rem;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CancellationType = styled.span`
  margin-right: 1rem;
  flex: 1 1 auto;

  svg {
    display: inline-block;
    margin-right: 0.5rem;
  }
`;

const CancellationContent = styled.div`
  width: 100%;
  padding: 0 1rem 0.75rem;
`;

const CancellationTime = styled.div`
  font-size: 0.875rem;
  text-align: right;
  margin-left: auto;

  svg {
    margin: 0 1rem;
  }

  strong {
    font-size: 0.87rem;
    font-weight: bold;
  }

  span {
    font-size: 0.7rem;
  }
`;

const CancellationTitle = styled(Heading).attrs({level: 5})`
  margin: 0;
  font-size: 0.875rem;
  font-weight: bold;
  color: inherit;
`;

const CancellationDescription = styled.div`
  margin: 0 0 1rem;
  font-size: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--lighter-grey);
`;

const CancellationInfo = styled.div`
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
`;

const CancellationInfoRow = styled.div`
  padding: 0.5rem 0 0;
`;

const CancellationPublishTime = styled.span`
  font-size: 0.75rem;
  margin-left: auto;
  color: var(--grey);
`;

const CancellationFooter = styled.div`
  margin-top: 0.375rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--alt-grey);
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Accordion = styled(ToggleView)`
  button {
    text-decoration: none;
    color: inherit;
    width: 100%;
    display: block;
  }
`;

const CancellationItem = observer(({cancellation}) => {
  const publishedMoment = moment.tz(cancellation.lastModifiedDateTime, TIMEZONE);
  const Icon = cancellation.isCancelled ? TrashCan : Checkmark;

  return (
    <CancellationComponent>
      <Accordion
        label={
          <CancellationHeader>
            <Row>
              <Icon
                width="1.25rem"
                fill={cancellation.isCancelled ? "var(--red)" : "var(--green)"}
              />
              <CancellationType>
                {cancellation.routeId} / {cancellation.direction}
              </CancellationType>
              <CancellationTime>
                <span>{format(cancellation.departureDate, "DD/MM")} </span>
                <strong>{cancellation.journeyStartTime}</strong>
              </CancellationTime>
            </Row>
            <Row>
              <CancellationTitle>{cancellation.title}</CancellationTitle>
            </Row>
          </CancellationHeader>
        }>
        <CancellationContent>
          <CancellationDescription>{cancellation.description}</CancellationDescription>
          <CancellationInfo>
            <CancellationInfoRow>
              {text("general.category")}: <strong>{cancellation.category}</strong>
            </CancellationInfoRow>
            <CancellationInfoRow>
              Subcategory: <strong>{cancellation.subCategory}</strong>
            </CancellationInfoRow>
            <CancellationInfoRow>
              {text("general.impact")}: <strong>{cancellation.cancellationEffect}</strong>
            </CancellationInfoRow>
          </CancellationInfo>
          <CancellationFooter>
            <CancellationPublishTime>
              <span>
                {publishedMoment.format("MM/DD")}, {publishedMoment.format("HH:mm")}
              </span>
            </CancellationPublishTime>
          </CancellationFooter>
        </CancellationContent>
      </Accordion>
    </CancellationComponent>
  );
});

export default CancellationItem;
