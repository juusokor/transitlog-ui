const createRouteIdentifier = ({routeId, direction, dateBegin, dateEnd}) =>
  `${routeId}_${direction}_${dateBegin}_${dateEnd}`;

export default createRouteIdentifier;
