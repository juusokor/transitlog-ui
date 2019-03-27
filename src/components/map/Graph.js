import React from "react";
import {app} from "mobx-app";
import {observer, inject} from "mobx-react";
import styled from "styled-components";
import doubleDigit from "../../helpers/doubleDigit";
import "react-vis/dist/style.css";
import {
  XYPlot,
  VerticalGridLines,
  HorizontalGridLines,
  XAxis,
  YAxis,
  AreaSeries,
  MarkSeries,
  Crosshair,
  LineSeries,
} from "react-vis";

const GraphTooltip = styled.div`
  font-weight: 500;
  white-space: nowrap;
  background: #ffffff;
  color: #007ac9;
  font-size: 0.75rem;
  border-radius: 5px;
  padding: 3px;
  border-style: solid;
  border-width: 1px;
`;

const ColoredBackgroundSlot = styled.div`
  font-family: "Courier New", Courier, monospace;
  border-radius: 4px;
  background: ${({backgroundColor}) => backgroundColor};
  color: white;
  font-size: 0.875rem;
  padding: 4px;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const Title = styled.div`
  padding: 5px;
`;

@inject(app("Filters", "UI"))
@observer
class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      highlight: {x: 0, y: 0},
      avgSpeed: {x: 0, y: 0},
    };
  }

  secondsToTime() {
    let diff = this.state.highlight.y;
    const departureDiffSign = diff < 0 ? "-" : "";
    diff = Math.abs(diff);
    let minutes = Math.floor(diff / 60);
    let seconds = diff - minutes * 60;
    minutes = doubleDigit(minutes);
    seconds = doubleDigit(seconds);
    return departureDiffSign + minutes + ":" + seconds;
  }

  coloredBackgroundSlotColor() {
    return this.state.highlight.departureColor
      ? this.state.highlight.departureColor
      : "var(--light-grey)";
  }

  render() {
    const {diffs, speedAverages, graphExpanded, UI, width} = this.props;

    const highlight = this.state.highlight;
    const avgSpeed = this.state.avgSpeed;
    const mapDiffs = diffs.map(function(o) {
      return o.y;
    });
    const max = Math.max.apply(Math, mapDiffs);
    const min = Math.min.apply(Math, mapDiffs);

    console.log(width);

    return (
      <div>
        {graphExpanded && width && (
          <XYPlot
            height={200}
            width={width}
            onClick={(d) => {
              this.props.Filters.setStop(highlight.stopId);
            }}
            yDomain={[min < -200 ? min : -200, max > 200 ? max : 200]}>
            <VerticalGridLines />
            <HorizontalGridLines />
            <YAxis title="sec, km/h" />
            <XAxis hideTicks />
            <Crosshair values={[highlight]}>
              <GraphTooltip>
                <FlexColumn>
                  <FlexRow>
                    <Title>Pysäkki: {highlight.stopId}</Title>
                    <ColoredBackgroundSlot
                      backgroundColor={this.coloredBackgroundSlotColor()}>
                      {this.secondsToTime()}
                    </ColoredBackgroundSlot>
                  </FlexRow>
                  <Title>Keskinopeus: {avgSpeed.y} km/h</Title>
                </FlexColumn>
              </GraphTooltip>
            </Crosshair>
            <AreaSeries
              data={diffs}
              curve="curveNatural"
              onNearestX={(d) => {
                UI.highlightStop(d.stopId);
                this.setState({
                  highlight: d,
                });
              }}
            />
            <LineSeries
              data={speedAverages}
              color={"red"}
              onNearestX={(d) => {
                const graphPoint = {x: d.x, y: d.y};
                this.setState({
                  avgSpeed: graphPoint,
                });
              }}
            />
            <MarkSeries
              colorType="literal"
              getColor={(d) => {
                return d.departureColor;
              }}
              data={[highlight]}
            />
            <MarkSeries data={[avgSpeed]} />
          </XYPlot>
        )}
      </div>
    );
  }
}

export default Graph;
