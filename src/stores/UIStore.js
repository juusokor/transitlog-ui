import {extendObservable, action} from "mobx";

export default (state) => {
  extendObservable(state, {
    selectedVehicle: null,
    filterPanelVisible: true,
  });

  const setSelectedVehicle = action((vehiclePosition = null) => {
    state.selectedVehicle = vehiclePosition;
  });

  const toggleFilterPanel = action((setTo = !state.filterPanelVisible) => {
    state.filterPanelVisible = setTo;
  });

  return {
    setSelectedVehicle,
    toggleFilterPanel,
  };
};
