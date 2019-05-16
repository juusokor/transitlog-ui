import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import {getCancellationKey} from "../helpers/getAlertKey";
import CancellationItem from "./CancellationItem";
import {ListHeading} from "./commonComponents";

const CancellationsListWrapper = styled.div`
  padding-bottom: 1rem;
`;

const decorate = flow(observer);

const CancellationsList = decorate(({className, cancellations = []}) => {
  const validCancellations =
    cancellations && Array.isArray(cancellations) ? cancellations : [];

  return (
    <CancellationsListWrapper className={className}>
      <ListHeading>Cancellations</ListHeading>
      {validCancellations.map((cancellation) => (
        <CancellationItem
          key={getCancellationKey(cancellation)}
          cancellation={cancellation}
        />
      ))}
    </CancellationsListWrapper>
  );
});

export default CancellationsList;
