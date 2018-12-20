import React from "react";
import gql from "graphql-tag";
import styled from "styled-components";

const EquipmentWrapper = styled.div``;

// const vehicleTypeQuery = gql``;

export default ({journey}) => {
  const {unique_vehicle_id} = journey;
  return <EquipmentWrapper>{unique_vehicle_id}</EquipmentWrapper>;
};
