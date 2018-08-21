import React from "react";
import {observer, inject} from "mobx-react";
import pick from "lodash/pick";

/* Pulls in a state property `prop` as a React prop into Component. */

export default (...pickProps) => (Component) =>
  inject("state")(
    observer((props) => {
      const propsFromState = pick(props.state, pickProps);
      return <Component {...props} {...propsFromState} />;
    })
  );
