import React from "react";
import {observer, inject} from "mobx-react";
import get from "lodash/get";

/* Pulls in a state property `prop` as a React prop into Component. */

export default (prop) => (Component) =>
  inject("state")(
    observer((props) => {
      const val = get(props, `state.${prop}`);

      return <Component {...props} {...{[prop]: val}} />;
    })
  );
