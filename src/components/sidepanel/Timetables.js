import React, {Component} from "react";
import {observer} from "mobx-react";
import SidepanelList from "./SidepanelList";
import StopTimetable from "./StopTimetable";
import withStop from "../../hoc/withStop";

@withStop
@observer
class Timetables extends Component {
  render() {
    const {stop, route} = this.props;

    return (
      <SidepanelList
        header={
          <>
            <span>[filter placeholder]</span>
            <span>[filter placeholder]</span>
          </>
        }>
        {stop && <StopTimetable route={route} stop={stop} />}
      </SidepanelList>
    );
  }
}

export default Timetables;
