import {useState} from "react";

export const useToggle = (initialValue = false) => {
  const [currentValue, setValue] = useState(initialValue);

  const toggleValue = (setTo = !currentValue) => {
    setValue(setTo);
  };

  return [currentValue, toggleValue];
};
