import {extendObservable, action} from "mobx";

export default (state) => {
  extendObservable(state, {
    filterPanelVisible: true,
  });

  const toggleFilterPanel = action((setTo = !state.filterPanelVisible) => {
    state.filterPanelVisible = setTo;
  });

  return {
    toggleFilterPanel,
  };
};
