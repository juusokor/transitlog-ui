import React, {Component} from 'react';
import {Map, TileLayer, ZoomControl} from 'react-leaflet';
import {Query} from 'react-apollo';
import gql from 'graphql-tag';
import 'leaflet/dist/leaflet.css';
import RouteLayer from './RouteLayer';
import HfpLayer from './HfpLayer';
import {hfpClient} from '../api.js';

const hfpQuery = gql`
  query hfpQuery($routeId: String!, $directionId: Int!, $startTime: Time!, $date: Date!){
   allVehicles(orderBy: RECEIVED_AT_ASC condition: {routeId: $routeId, directionId: $directionId, journeyStartTime: $startTime, oday: $date}) {
     nodes {
       receivedAt
       lat
       long
       uniqueVehicleId
     }
   }
  }`;

const lineQuery = gql`
  query lineQuery($lineId: String!, $dateBegin: Date!, $dateEnd: Date!) {
    line: lineByLineIdAndDateBeginAndDateEnd(lineId: $lineId, dateBegin: $dateBegin, dateEnd: $dateEnd) {
      lineId
      nameFi
      routes {
        nodes {
          routeId
          direction
          dateBegin
          dateEnd
          routeSegments {
            nodes {
              stopIndex
              timingStopType
              duration
              stop: stopByStopId {
                stopId
                lat
                lon
                shortId
                nameFi
                nameSe
              }
            }
          }
          geometries {
            nodes {
              geometry
              dateBegin
              dateEnd
            }
          }
        }
      }
      notes {
        nodes {
          noteType
          noteText
          dateEnd
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
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <Map center={position} zoom={this.state.zoom} maxZoom={18} zoomControl={false}>
        <TileLayer
          attribution={'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors '}
          url="https://digitransit-prod-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}@2x.png"
          tileSize={512}
          zoomOffset={-1}
        />
        <ZoomControl position="topright"/>
        <Query query={lineQuery} variables={this.props.selectedRoute}>
          {({ loading, error, data }) => {
          // FIXME: returning divs for loading and error do not make sense for map layers - figure out something else
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error!</div>;
          if (!data.line) return <div>No route!</div>;
          // FIXME: now just picks the first geometry of first route of selected line, atleast route should be selected
          return (<RouteLayer line={data.line.routes.nodes[0].geometries.nodes[0]}/>);
          }}
        </Query>
      <Query client={hfpClient} query={hfpQuery} variables={{routeId: this.props.selectedRoute.lineId, directionId: 1, startTime: this.props.startTime, date: this.props.date}}>
          {({ loading, error, data }) => {
              console.log('HFP', loading, error, data);
              if (loading) return <div>Loading...</div>;
              if (error) return <div>Error!</div>;
              if (!data.allVehicles.nodes) return <div>No route!</div>;
              return (<HfpLayer positions = {data.allVehicles.nodes}/>)
          }}
      </Query>
     </Map>
    )
  }
}
