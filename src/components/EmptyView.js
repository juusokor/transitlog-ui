import React from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../helpers/inject";
import styled from "styled-components";
import LostProperty from "../icons/LostProperty";

const decorate = flow(
  observer,
  inject("UI")
);

const EmptyViewWrapper = styled.div`
  padding: 1rem;
  margin: 1rem;
  border-radius: 10px;
  border: 1px solid var(--alt-grey);

  svg {
    display: block;
    margin: 0.75rem auto 1.75rem;
  }
`;

const EmptyViewHeading = styled.h3`
  margin-top: 0;
  color: var(--alt-grey);
`;

const ErrorMessage = styled.div`
  color: var(--grey);
  font-size: 0.875rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EmptyView = decorate(({error}) => {
  const messages = [];

  if (error.networkError) {
    messages.push(error.networkError.message);
  }

  if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
    for (const err of error.graphQLErrors) {
      messages.push(err.message);
    }
  }

  if (error.emptyDataError) {
    messages.push(error.emptyDataError.message);
  }

  return (
    <EmptyViewWrapper>
      <LostProperty fill="var(--alt-grey)" height="7rem" width="7rem" />
      <EmptyViewHeading>It's empty. What'cha gonna do about it?</EmptyViewHeading>
      {messages.length && (
        <>
          <p>Reasons:</p>
          {messages.map((msg, idx) => (
            <ErrorMessage key={`error_message_${idx}`}>{msg}</ErrorMessage>
          ))}
        </>
      )}
    </EmptyViewWrapper>
  );
});

export default EmptyView;
