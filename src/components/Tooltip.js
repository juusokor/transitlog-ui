import React, {useMemo} from "react";
import {useTooltip} from "../hooks/useTooltip";

const Tooltip = ({children, helpText = ""}) => {
  const tooltipProps = useTooltip(helpText);

  const child = useMemo(() => {
    const onlyChild = React.Children.only(children);
    return React.cloneElement(onlyChild, tooltipProps);
  }, [children, tooltipProps]);

  return child;
};

export default Tooltip;
