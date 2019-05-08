import Alert from "../icons/Alert";
import React from "react";
import styled from "styled-components";
import Info from "../icons/Info";

const IconStyle = styled.div`
  margin-right: 0.25rem;
`;

const AlertsIcon = ({className, type = "ALERT"}) => {
  const Icon = type === "INFO" ? Info : Alert;
  const color = type === "INFO" ? "var(--light-blue)" : "var(--red)";

  const IconComponent = IconStyle.withComponent(Icon);

  return (
    <IconComponent className={className} fill={color} width="0.75rem" height="0.75rem" />
  );
};

export default AlertsIcon;
