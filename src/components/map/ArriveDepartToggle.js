import React from "react";
import {observer} from "mobx-react";

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
        Arrive
      </label>
      <label>
        <input
          type="radio"
          value="depart"
          checked={value === "depart"}
          name="showTime"
          onChange={onChange}
        />{" "}
        Depart
      </label>
    </div>
  );
});
