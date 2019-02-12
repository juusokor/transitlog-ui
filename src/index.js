/* eslint-disable import/first */
import moment from "moment-timezone";
import {TIMEZONE} from "./constants";

// Set the default timezone for the app
moment.tz.setDefault(TIMEZONE);

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {StoreContext, store} from "./stores/StoreContext";
import {Provider} from "mobx-react";

const root = document.getElementById("root");

const render = () => {
  const Root = require("./Root").default;

  ReactDOM.render(
    <Provider {...store}>
      <StoreContext.Provider value={store}>
        <Root />
      </StoreContext.Provider>
    </Provider>,
    root
  );
};

render();
