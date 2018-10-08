import React from "react";
import {observer} from "mobx-react";
import {Text} from "../../helpers/text";

export default observer(({value, onChange}) => {
  return (
    <div>
      <label>
        <input
          type="radio"
          value="arrive"
          checked={value === "arrive"}
          name="showTime"
          onChange={onChange}
        />{" "}
        <Text>map.stops.arrive</Text>
      </label>
      <label>
        <input
          type="radio"
          value="depart"
          checked={value === "depart"}
          name="showTime"
          onChange={onChange}
        />{" "}
        <Text>map.stops.depart</Text>
      </label>
    </div>
  );
});
