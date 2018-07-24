const createRouteIdentifier = ({routeId, direction, dateBegin}) =>
  `${routeId}_${direction}_${dateBegin}`;

export default createRouteIdentifier;
