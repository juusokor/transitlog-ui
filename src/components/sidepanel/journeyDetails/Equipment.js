import React from "react";
import gql from "graphql-tag";
import styled from "styled-components";

const EquipmentWrapper = styled.div`
  padding: 2rem 1rem 0 2rem;
`;

// const vehicleTypeQuery = gql``;

export default ({observedVehicleId}) => {
  return <EquipmentWrapper>Vehicle used: {observedVehicleId}</EquipmentWrapper>;
};
