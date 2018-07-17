import React, {Component} from "react";
import {Map, TileLayer, ZoomControl, Pane} from "react-leaflet";
import {Query} from "react-apollo";
import gql from "graphql-tag";
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
    this.state = {
      lat: 60.170988,
      lng: 24.940842,
      zoom: 13,
    };
  }

  render() {
    const {route, dateBegin, dateEnd, startTime} = this.props;

    const position = [this.state.lat, this.state.lng];
    return (
      <Map center={position} zoom={this.state.zoom} maxZoom={18} zoomControl={false}>
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
        <Query query={routeQuery} variables={{...route, dateBegin, dateEnd}}>
          {({loading, error, data}) => {
            // FIXME: returning divs for loading and error do not make sense for map layers - figure out something else
            if (loading) return <div>Loading...</div>;
            if (error) return <div>Error!</div>;
            if (!data.line) return <div>No route!</div>;
            return <RouteLayer line={data.route.geometries.nodes[0]} />;
          }}
        </Query>
        <Query
          client={hfpClient}
          query={hfpQuery}
          variables={{...route, startTime, date: dateBegin }}>
          {({loading, error, data}) => {
            console.log("HFP", loading, error, data);
            if (loading) return <div>Loading...</div>;
            if (error) return <div>Error!</div>;
            if (!data.allVehicles.nodes) return <div>No route!</div>;
            return <HfpLayer positions={data.allVehicles.nodes} />;
          }}
        </Query>
      </Map>
    );
  }
}
