import React, {Component} from "react";
import "./FilterPanel.css";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import {RouteInput} from "./RouteInput";
import RoutesByLineQuery from "../../queries/RoutesByLineQuery";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import Header from "./Header";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import AllLinesQuery from "../../queries/AllLinesQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

@inject(app("Filters"))
@observer
class FilterPanel extends Component {
  state = {
    visible: true,
  };

  toggleVisibility = (e) => {
    e.preventDefault();

    this.setState({
      visible: !this.state.visible,
    });
  };

  onChangeQueryVehicle = ({target}) => {
    this.props.Filters.setVehicle(target.value);
  };

  render() {
    const {state, Filters} = this.props;
    const {visible} = this.state;
    const {vehicle, stop, route, line, date} = state;

    return (
      <header
        className={`transitlog-header filter-panel ${visible ? "visible" : ""}`}>
        <Header />
        <DateSettings />
        <TimeSettings />
        <p>
          <input
            type="text"
            name="vehicle"
            value={vehicle}
            onChange={this.onChangeQueryVehicle}
          />
        </p>
        {!!route ? (
          <StopsByRouteQuery key="stop_input_by_route" route={route}>
            {({stops}) => (
              <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
            )}
          </StopsByRouteQuery>
        ) : (
          <AllStopsQuery key="all_stops">
            {({stops}) => (
              <StopInput onSelect={Filters.setStop} stop={stop} stops={stops} />
            )}
          </AllStopsQuery>
        )}
        <AllLinesQuery date={date}>
          {({lines}) => (
            <LineInput line={line} onSelect={Filters.setLine} lines={lines} />
          )}
        </AllLinesQuery>
        {line.lineId &&
          line.dateBegin && (
            <RoutesByLineQuery line={line}>
              {({routes}) => (
                <RouteInput
                  route={route}
                  onRouteSelected={Filters.setRoute}
                  routes={routes}
                />
              )}
            </RoutesByLineQuery>
          )}
        <button className="toggle-filter-panel" onClick={this.toggleVisibility}>
          {visible ? "<" : ">"}
        </button>
      </header>
    );
  }
}

export default FilterPanel;
