import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// eslint-disable-next-line
import Root from "./Root";
import {AppContainer} from "react-hot-loader";

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
