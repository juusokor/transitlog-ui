import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
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
    <Provider state={state} actions={actions}>
      <Root />
    </Provider>,
    root
  );
};

render();
