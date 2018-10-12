import React from "react";
import {observer} from "mobx-react";
import {Text} from "../../helpers/text";
import ToggleButton from "../ToggleButton";

export default observer(({value, onChange}) => {
  return (
    <div>
      <ToggleButton
        value="arrive"
        checked={value === "arrive"}
        name="showTime"
        onChange={onChange}>
        <Text>map.stops.arrive</Text>
      </ToggleButton>
      <ToggleButton
        value="depart"
        checked={value === "depart"}
        name="showTime"
        onChange={onChange}>
        <Text>map.stops.depart</Text>
      </ToggleButton>
    </div>
  );
});
