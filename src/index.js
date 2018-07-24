import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Root from "./Root";
import {AppContainer, setConfig} from "react-hot-loader";

setConfig({logLevel: "debug"});

const root = document.getElementById("root");

const render = () => {
  const Root = require("./Root").default;

  ReactDOM.render(
    <AppContainer>
      <Root />
    </AppContainer>,
    root
  );
};

render();

if (module.hot) {
  module.hot.accept("./Root", () => {
    render();
  });
}
