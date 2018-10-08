import React from "react";
import logo from "../../hsl-logo.png";
import {Text} from "../../helpers/text";

export default () => {
  return (
    <div>
      <img src={logo} className="App-logo" alt="logo" />
      <h1 className="App-title">
        <Text>filterpanel.heading</Text>
      </h1>
    </div>
  );
};
