import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
// eslint-disable-next-line
import Root from "./Root";
import {AppContainer} from "react-hot-loader";
import {createStore} from "mobx-app";
import FilterStore from "./stores/FilterStore";
import TimeStore from "./stores/TimeStore";
import UIStore from "./stores/UIStore";
import {Provider} from "mobx-react";
import JourneyStore from "./stores/JourneyStore";

const root = document.getElementById("root");

const {state, actions} = createStore({
  Filters: FilterStore,
  Time: TimeStore,
  UI: UIStore,
  Journey: JourneyStore,
});

const render = () => {
  const Root = require("./Root").default;

  ReactDOM.render(
    <AppContainer>
      <Provider state={state} actions={actions}>
        <Root />
      </Provider>
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
