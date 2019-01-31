import isEqual from "lodash/isEqual";
import {render} from "react-testing-library";
import React from "react";

export const renderComponent = (getComponent = () => {}) => {
  let mounted;
  let renderedProps = {};

  return {
    component: (props) => {
      if (!mounted) {
        mounted = render(getComponent(props));
        renderedProps = props;
      } else if (mounted && !isEqual(renderedProps, props)) {
        mounted.rerender(getComponent(props));
        renderedProps = props;
      }

      return mounted;
    },
    onBeforeEach: () => {
      mounted = false;
      renderedProps = {};
    },
  };
};
