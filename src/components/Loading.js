import React from "react";
import Spinner from "react-spinkit";
import styled from "styled-components";

const Loading = styled.div`
  color: white;

  .sk-circle {
    width: 2rem;
    height: 2rem;
    transform: translateY(0.25rem);
  }
`;

export default () => {
  return (
    <Loading>
      <Spinner name="circle" color="white" fadeIn="none" />
    </Loading>
  );
};
