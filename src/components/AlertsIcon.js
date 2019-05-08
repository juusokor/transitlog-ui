import Alert from "../icons/Alert";
import React from "react";
import styled from "styled-components";

const AlertIcon = styled(Alert)`
  position: absolute;
  top: 100%;
  left: 0;
  transform: translate(-25%, -50%);
`;

const AlertsIcon = ({className}) => {
  return (
    <AlertIcon className={className} fill="var(--red)" width="0.75rem" height="0.75rem" />
  );
};

export default AlertsIcon;
