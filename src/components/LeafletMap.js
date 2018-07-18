import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane} from "react-leaflet";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import "leaflet/dist/leaflet.css";
import RouteLayer from "./RouteLayer";
import HfpLayer from "./HfpLayer";
import {hfpClient} from "../api.js";

const hfpQuery = gql`
  query hfpQuery(
    $routeId: String!
    $direction: Int!
    $startTime: Time!
    $date: Date!
  ) {
    allVehicles(
      orderBy: RECEIVED_AT_ASC
      condition: {
        routeId: $routeId
        directionId: $direction
        journeyStartTime: $startTime
        oday: $date
      }
    ) {
      nodes {
        receivedAt
        lat
        long
        uniqueVehicleId
      }
    }
  }
`;

const routeQuery = gql`
  query routeQuery(
    $routeId: String!
    $direction: String!
    $dateBegin: Date!
    $dateEnd: Date!
  ) {
    route: routeByRouteIdAndDirectionAndDateBeginAndDateEnd(
      routeId: $routeId
      direction: $direction
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      geometries {
        nodes {
          geometry
        }
      }
    }
  }
`;

export class LeafletMap extends Component {
  constructor() {
    super();
    this.state = {lat: 60.170988, lng: 24.940842, zoom: 13};
  }

  map = React.createRef();

  render() {
    const {route, queryTime, queryDate} = this.props;
    const {routeId, direction, dateBegin, dateEnd} = route;

    const position = [this.state.lat, this.state.lng];
    return (
      <Map
        center={position}
        ref={this.map}
        zoom={this.state.zoom}
        maxZoom={18}
        zoomControl={false}>
        <Pane name="hfp" style={{zIndex: 450}} />
        <TileLayer
          attribution={
            'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '
          }
          url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
          tileSize={512}
          zoomOffset={-1}
        />
        <ZoomControl position="topright" />
        <Query
          query={routeQuery}
          fetchPolicy="cache-and-network"
          variables={{
            routeId,
            direction,
            dateBegin,
            dateEnd,
          }}>
          {({loading, error, data}) => {
            const positions = get(
              data,
              "route.geometries.nodes[0].geometry.coordinates",
              []
            );

            if (loading || error || positions.length === 0) return null;
            return (
              <RouteLayer key={`${routeId}_${direction}`} positions={positions} />
            );
          }}
        </Query>
        <Query
          client={hfpClient}
          query={hfpQuery}
          fetchPolicy="cache-and-network"
          variables={{
            routeId,
            direction: parseInt(direction),
            startTime: queryTime,
            date: queryDate,
          }}>
          {({loading, error, data}) => {
            const positions = get(data, "allVehicles.nodes", []);
            if (loading || error || positions.length === 0) return null;
            return (
              <HfpLayer key={`${routeId}_${direction}`} positions={positions} />
            );
          }}
        </Query>
      </Map>
    );
  }
}
