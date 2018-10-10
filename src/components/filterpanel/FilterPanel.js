import React, {Component} from "react";
import LineInput from "./LineInput";
import StopInput from "./StopInput";
import RouteInput from "./RouteInput";
import RoutesByLineQuery from "../../queries/RoutesByLineQuery";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopsByRouteQuery from "../../queries/StopsByRouteQuery";
import Header from "./Header";
import DateSettings from "./DateSettings";
import TimeSettings from "./TimeSettings";
import AllLinesQuery from "../../queries/AllLinesQuery";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import JourneyList from "./JourneyList";
import VehicleInput from "./VehicleInput";
import Loading from "../Loading";
import LanguageSelect from "./LanguageSelect";
import {Text} from "../../helpers/text";
import styled, {css} from "styled-components";
import {Button} from "../Forms";

const FilterPanelWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  background: var(--lightest-grey);
  color: var(--dark-grey);
  transition: transform 0.3s ease-out;
  transform: translateX(${({visible = true}) => (visible ? 0 : "calc(-100%)")});
  border-right: 1px solid var(--alt-grey);
  display: grid;
  grid-template-rows: 7.5rem 1fr 1fr;
`;

const FilterSection = styled.div`
  width: 100%;
  margin-top: 1rem;
  padding: 0 1rem 1rem;
  border-bottom: 1px solid var(--alt-grey);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.2s ease-out;

  ${({loading = false}) =>
    loading
      ? css`
          opacity: 1;
          pointer-events: all;
        `
      : ""};
`;

const JourneyListWrapper = styled.div`
  position: relative;
`;

@inject(app("Filters", "UI"))
@observer
class FilterPanel extends Component {
  onChangeQueryVehicle = (value) => {
    this.props.Filters.setVehicle(value);
  };

  render() {
    const {state, Filters, loading} = this.props;
    const {vehicle, stop, route, line, date, filterPanelVisible: visible} = state;

    return (
      <FilterPanelWrapper visible={visible}>
        <Header />
        <div>
          <FilterSection>
            <LanguageSelect />
          </FilterSection>
          <FilterSection>
            <Button onClick={Filters.reset}>
              <Text>filterpanel.reset</Text>
            </Button>
          </FilterSection>
          <FilterSection>
            <DateSettings />
          </FilterSection>
          <FilterSection>
            <TimeSettings />
          </FilterSection>
          <FilterSection>
            <VehicleInput value={vehicle} onSelect={this.onChangeQueryVehicle} />
            {!!route.routeId ? (
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
              {({lines, loading, error}) => {
                if (loading || error) {
                  return null;
                }

                return (
                  <LineInput line={line} onSelect={Filters.setLine} lines={lines} />
                );
              }}
            </AllLinesQuery>
            {line.lineId &&
              line.dateBegin && (
                <RoutesByLineQuery
                  key={`line_route_${Object.values(line).join("_")}`}
                  date={date}
                  line={line}>
                  {({routes, loading, error}) => {
                    if (loading || error) {
                      return null;
                    }

                    return <RouteInput route={route} routes={routes} />;
                  }}
                </RoutesByLineQuery>
              )}
          </FilterSection>
        </div>
        <JourneyListWrapper>
          <JourneyList />
          <LoadingContainer loading={loading}>
            <Loading />
          </LoadingContainer>
        </JourneyListWrapper>
      </FilterPanelWrapper>
    );
  }
}

export default FilterPanel;
