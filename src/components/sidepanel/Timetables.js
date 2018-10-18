import React, {Component} from "react";
import {observer} from "mobx-react";
import SidepanelList from "./SidepanelList";
import StopTimetable from "./StopTimetable";
import {Text} from "../../helpers/text";
import withStop from "../../hoc/withStop";

@withStop
@observer
class Timetables extends Component {
  render() {
    const {stop} = this.props;

    return (
      <SidepanelList
        header={
          <>
            <span>Filter line</span>
            <span>Filter ???</span>
          </>
        }>
        {stop && <StopTimetable stop={stop} />}
      </SidepanelList>
    );
  }
}

export default Timetables;
