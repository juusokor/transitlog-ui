import React from "react";
import Spinner from "react-spinkit";
import styled, {css} from "styled-components";

const Loading = styled.div`
  color: white;
  ${({inline}) =>
    inline
      ? css`
          width: 1rem;
          height: 1rem;
          position: relative;
          display: inline-block;
        `
      : ""};

  .sk-circle {
    width: 2rem;
    height: 2rem;
    transform: translateY(0.25rem);

    ${({inline}) =>
      inline
        ? css`
            top: 50%;
            left: 50%;
            width: 1.5rem;
            height: 1.5rem;
            margin: -0.75rem 0 0 -0.75rem;
            transform: none;
          `
        : ""};
  }
`;

export default ({inline}) => {
  return (
    <Loading inline={inline}>
      <Spinner name="circle" color="white" fadeIn="none" />
    </Loading>
  );
};
