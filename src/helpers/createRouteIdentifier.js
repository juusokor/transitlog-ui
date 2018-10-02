const createRouteIdentifier = ({routeId, direction, dateBegin, dateEnd}) =>
  `route:${routeId}_${direction}_${dateBegin}_${dateEnd}`;

export default createRouteIdentifier;
