import React from "react";
import styled, {keyframes} from "styled-components";
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

  svg {
    display: block;
    animation: ${spin} 1.5s linear infinite;
  }
`;

export default ({size = 35}) => {
  return (
    <Loading>
      <Spinner width={size} height={size} />
    </Loading>
  );
};
