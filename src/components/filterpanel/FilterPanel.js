import React, {Component} from "react";
import "./FilterPanel.css";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import {RouteInput} from "./RouteInput";
import QueryRoutesByLine from "../../queries/RoutesByLineQuery";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import Header from "./Header";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import AllLinesQuery from "../../queries/AllLinesQuery";
import {observer} from "mobx-react";

@observer
class FilterPanel extends Component {
  render() {
    const {stop, route, line, onStopSelected, onRouteSelected} = this.props;

    return (
      <header className="transitlog-header filter-panel">
        <Header />
        <DateSettings />
        <TimeSettings />
        {!!route.routeId ? (
          <StopsByRouteQuery
            key="stop_input_by_route"
            variables={{
              routeId: route.routeId,
              direction: route.direction,
              dateBegin: route.dateBegin,
              dateEnd: route.dateEnd,
            }}>
            {({stops}) => (
              <StopInput onSelect={onStopSelected} stop={stop} stops={stops} />
            )}
          </StopsByRouteQuery>
        ) : (
          <AllStopsQuery key="all_stops">
            {({stops}) => (
              <StopInput onSelect={onStopSelected} stop={stop} stops={stops} />
            )}
          </AllStopsQuery>
        )}
        <AllLinesQuery queryDate={date}>
          {({lines}) => (
            <LineInput
              line={this.props.line}
              onSelect={this.props.onLineSelected}
              lines={lines}
            />
          )}
        </AllLinesQuery>
        {line.lineId && (
          <QueryRoutesByLine variables={line}>
            {({routes}) => (
              <RouteInput
                route={route}
                onRouteSelected={onRouteSelected}
                routes={routes}
              />
            )}
          </QueryRoutesByLine>
        )}
      </header>
    );
  }
}

export default FilterPanel;
