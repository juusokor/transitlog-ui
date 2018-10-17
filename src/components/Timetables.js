import React, {Component} from "react";
import {observer} from "mobx-react";
import SidepanelList from "./SidepanelList";
import StopTimetable from "./map/StopTimetable";
import {Text} from "../helpers/text";
import get from "lodash/get";

@observer
class Timetables extends Component {
  render() {
    const {stop} = this.props;

    const stopId = get(stop, "stopId", null);

    return (
      <SidepanelList
        header={
          <>
            <span>
              <Text>general.hour</Text>
            </span>
            <span>
              <strong>
                <Text>domain.line</Text>
              </strong>
              : <Text>general.minutes</Text>
            </span>
          </>
        }>
        <StopTimetable stopId={stopId} />
      </SidepanelList>
    );
  }
}

export default Timetables;
