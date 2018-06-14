import React, {Component} from 'react';
import PropTypes from 'prop-types'
import {Polyline} from 'react-leaflet'

const MapLayer = ({line}) => {
    const coords = line.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    return (<Polyline positions={coords}/>)
}

export default MapLayer;
