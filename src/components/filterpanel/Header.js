import React from "react";
import logo from "../../hsl-logo.png";
import {Text} from "../../helpers/text";

export default () => {
  return (
    <div className="filter-panel-header">
      <img src={logo} className="header-logo" alt="logo" />
      <h1 className="header-title">
        <Text>filterpanel.heading</Text>
      </h1>
    </div>
  );
};
