import React from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {inject} from "../helpers/inject";
import styled from "styled-components";
import SomethingWrong from "../icons/SomethingWrong";
import Privacy from "../icons/Privacy";
import Alert from "../icons/Alert";
import SignIn from "../icons/SignIn";
import NoConnection from "../icons/NoConnection";

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

const ErrorMessage = styled.li`
  color: var(--grey);
  font-size: 0.875rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorList = styled.ul`
  padding: 0 0 0 1rem;
`;

const MessagesHeading = styled.p`
  color: var(--grey);
  font-size: 0.875rem;
  font-weight: bold;
  margin-top: 1.75rem;
`;

const emptyReasons = {
  NETWORK: "network",
  UNKNOWN: "unknown",
  NODATA: "no-data",
  AUTHENTICATION: "authentication",
};

const EmptyView = decorate(({error}) => {
  const messages = [];
  let emptyReason = emptyReasons.UNKNOWN;

  if (error.networkError) {
    messages.push(error.networkError.message);
    emptyReason = emptyReasons.NETWORK;
  }

  if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
    for (const err of error.graphQLErrors) {
      messages.push(err.message);
    }

    emptyReason = error.graphQLErrors.some(
      (err) => err.extensions.code === "UNAUTHENTICATED"
    )
      ? emptyReasons.AUTHENTICATION
      : emptyReasons.UNKNOWN;
  }

  if (error.emptyDataError) {
    messages.push(error.emptyDataError.message);
    emptyReason = emptyReasons.NODATA;
  }

  return (
    <EmptyViewWrapper>
      {emptyReason === emptyReasons.NETWORK ? (
        <>
          <NoConnection fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>
            The data in this view is unavailable due to a network issue. Make sure you are
            online and try again.
          </p>
        </>
      ) : emptyReason === emptyReasons.AUTHENTICATION ? (
        <>
          <SignIn fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>Your account does not have access to the data in this view.</p>
        </>
      ) : emptyReason === emptyReasons.NODATA ? (
        <>
          <Alert fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>The server did not return any data for this request.</p>
        </>
      ) : (
        <>
          <SomethingWrong fill="var(--alt-grey)" height="5rem" width="5rem" />
          <p>For some reason, the data in this view is unavailable or does not exist.</p>
        </>
      )}
      {messages.length && (
        <>
          {emptyReason === emptyReasons.NETWORK ? (
            <MessagesHeading>Error messages:</MessagesHeading>
          ) : (
            <MessagesHeading>Messages from the server:</MessagesHeading>
          )}
          <ErrorList>
            {messages.map((msg, idx) => (
              <ErrorMessage key={`error_message_${idx}`}>{msg}</ErrorMessage>
            ))}
          </ErrorList>
        </>
      )}
    </EmptyViewWrapper>
  );
});

export default EmptyView;
