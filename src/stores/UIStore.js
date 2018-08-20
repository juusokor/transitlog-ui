import {extendObservable, action} from "mobx";

export default (state) => {
  extendObservable(state, {
    selectedVehicle: null,
  });

  const setSelectedVehicle = action((vehiclePosition = null) => {
    state.selectedVehicle = vehiclePosition;
  });

  return {
    setSelectedVehicle,
  };
};
