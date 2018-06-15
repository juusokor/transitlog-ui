import React, {Component} from 'react';
import {Polyline} from 'react-leaflet'

const HfpLayer = ({vehicle}) => {
    const coords = vehicle.nodes.coordinates.map(([lon, lat]) => [lat, lon]);
    return (<Polyline color={"red"} positions={coords}/>)
}

export default HfpLayer;
