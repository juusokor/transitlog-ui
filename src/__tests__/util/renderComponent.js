import isEqual from "lodash";
import {render} from "react-testing-library";
import React from "react";

export const renderComponent = (getComponent = () => {}) => {
  let mounted;
  let renderedProps = {};

  return {
    component: (props) => {
      const content = getComponent(props);

      if (!mounted || !isEqual(renderedProps, props)) {
        mounted = render(content);
        renderedProps = props;
      } else if (mounted && !isEqual(renderedProps, props)) {
        mounted = mounted.rerender(content);
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
