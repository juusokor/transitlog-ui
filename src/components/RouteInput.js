import React, {Component} from 'react';

export class RouteInput extends Component {
    constructor(props) {
        super(props);
        
    }
    
    render() {
        const options = this.props.routes.line.routes.nodes.map(({direction, originFi, destinationFi}) => (originFi + '-' + destinationFi))
        console.log('routes', options)
        return (
        <select>
            <option value='foo'/>
        </select>
        )
    }
}

//     options.map(({o}) => (<option value=o/>) )