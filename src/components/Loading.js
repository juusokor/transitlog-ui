import React from "react";
import styled, {keyframes, css} from "styled-components";
import Spinner from "../icons/Spinner";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  
  to {
    transform: rotate(360deg);
  }
`;

const Loading = styled.div`
  background: white;
  border-radius: 50%;
  padding: 0.75rem;
  box-shadow: 2px 2px 10px 0 rgba(0, 0, 0, 0.2);
  color: white;

  ${({inline}) =>
    inline
      ? css`
          width: 0.75rem;
          height: 0.75rem;
          padding: 0;
          background: transparent;
          box-shadow: none;
          position: relative;
          display: inline-block;
        `
      : ""};

  svg {
    display: block;
    animation: ${spin} 1.5s linear infinite;

    ${({inline}) =>
      inline
        ? css`
            position: absolute;
            top: -50%;
            left: -120%;
          `
        : ""};
  }
`;

export default ({size = 35, inline}) => {
  return (
    <Loading inline={inline}>
      <Spinner width={inline ? "1.5rem" : size} height={inline ? "1.5rem" : size} />
    </Loading>
  );
};
