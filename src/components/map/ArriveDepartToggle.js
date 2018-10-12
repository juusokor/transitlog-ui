import React from "react";
import {observer} from "mobx-react";
import {Text} from "../../helpers/text";
import ToggleButton from "../ToggleButton";
import styled from "styled-components";

const ToggleWrapper = styled.div`
  margin: 1rem 0;
`;

export default observer(({value, onChange}) => {
  return (
    <ToggleWrapper>
      <ToggleButton
        type="checkbox"
        value="departTimes"
        checked={value === "depart"}
        name="showTime"
        isSwitch={true}
        onChange={onChange(value === "depart" ? "arrive" : "depart")}
        preLabel={<Text>map.stops.arrive</Text>}>
        <Text>map.stops.depart</Text>
      </ToggleButton>
    </ToggleWrapper>
  );
});
