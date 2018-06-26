import React, {Component} from 'react';
import {Map, TileLayer, ZoomControl} from 'react-leaflet';
import {Query} from 'react-apollo';
import gql from 'graphql-tag';
import 'leaflet/dist/leaflet.css';
import MapLayer from './MapLayer';
import HfpLayer from './HfpLayer'
import {hfpClient} from '../api.js'

import {Polyline} from 'react-leaflet'


const hfpQuery = gql`
  query hfpQuery($routeId: String!, $directionId: Int!, $startTime: Time!, $date: Date!){
   allVehicles(condition: {routeId: $routeId, directionId: $directionId, journeyStartTime: $startTime, oday: $date}) {
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
    super()
    this.state = {
      lat: 60.20,
      lng: 24.93,
      zoom: 13,
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <Map center={position} zoom={this.state.zoom} maxZoom={22} zoomControl={false}>
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
          return (<MapLayer line={data.line.routes.nodes[0].geometries.nodes[0]}/>);
          }}
        </Query>
        <Query client={hfpClient} query={hfpQuery} variables={{routeId: '1006', directionId: 2, startTime: '11:29:00', date: '2018-05-06'}}>
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

        