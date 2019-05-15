export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A Date string in YYYY-MM-DD format. The timezone is assumed to be Europe/Helsinki. */
  Date: any;
  /** The direction of a route. An integer of either 1 or 2. */
  Direction: any;
  /** A DateTime string in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). Timezone will be converted to Europe/Helsinki. */
  DateTime: any;
  /** A string that defines a bounding box. The coordinates should be in the format
   * `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's
   * LatLngBounds.toBBoxString() returns. Toe coordinates will be rounded, use
   * PreciseBBox if this is not desired.
   */
  BBox: any;
  /** Time is seconds from 00:00:00 in format HH:mm:ss. The hours value can be more
   * than 23. The timezone is assumed to be Europe/Helsinki
   */
  Time: any;
  /** A string that uniquely identifies a vehicle. The format is [operator
   * ID]/[vehicle ID]. The operator ID is padded to have a length of 4 characters.
   */
  VehicleId: any;
  /** A string that defines a bounding box. The coordinates should be in the format
   * `minLng,maxLat,maxLng,minLat` which is compatible with what Leaflet's
   * LatLngBounds.toBBoxString() returns. The precise bbox is not rounded.
   */
  PreciseBBox: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Alert = {
  id: Scalars["ID"];
  level: AlertLevel;
  category: AlertCategory;
  distribution: AlertDistribution;
  impact: AlertImpact;
  affectedId: Scalars["String"];
  startDateTime: Scalars["DateTime"];
  endDateTime: Scalars["DateTime"];
  publishedDateTime: Scalars["DateTime"];
  updatedDateTime?: Maybe<Scalars["DateTime"]>;
  title: Scalars["String"];
  description: Scalars["String"];
  url?: Maybe<Scalars["String"]>;
};

export enum AlertCategory {
  VehicleBreakdown = "VEHICLE_BREAKDOWN",
  Accident = "ACCIDENT",
  NoDriver = "NO_DRIVER",
  Assault = "ASSAULT",
  Weather = "WEATHER",
  VehicleOffTheRoad = "VEHICLE_OFF_THE_ROAD",
  Seizure = "SEIZURE",
  ItsSystemError = "ITS_SYSTEM_ERROR",
  OtherDriverError = "OTHER_DRIVER_ERROR",
  TooManyPassengers = "TOO_MANY_PASSENGERS",
  Strike = "STRIKE",
  Other = "OTHER",
  EarlierDisruption = "EARLIER_DISRUPTION",
  NoTrafficDisruption = "NO_TRAFFIC_DISRUPTION",
  TrackBlocked = "TRACK_BLOCKED",
  StaffDeficit = "STAFF_DEFICIT",
  Disturbance = "DISTURBANCE",
  VehicleDeficit = "VEHICLE_DEFICIT",
  RoadClosed = "ROAD_CLOSED",
  RoadTrench = "ROAD_TRENCH",
  TrackMaintenance = "TRACK_MAINTENANCE",
  TrafficAccident = "TRAFFIC_ACCIDENT",
  TrafficJam = "TRAFFIC_JAM",
  MedicalIncident = "MEDICAL_INCIDENT",
  WeatherConditions = "WEATHER_CONDITIONS",
  TechnicalFailure = "TECHNICAL_FAILURE",
  Test = "TEST",
  RoadMaintenance = "ROAD_MAINTENANCE",
  SwitchFailure = "SWITCH_FAILURE",
  StateVisit = "STATE_VISIT",
  PowerFailure = "POWER_FAILURE",
  MisparkedVehicle = "MISPARKED_VEHICLE",
  PublicEvent = "PUBLIC_EVENT",
}

export enum AlertDistribution {
  Stop = "STOP",
  AllStops = "ALL_STOPS",
  Route = "ROUTE",
  AllRoutes = "ALL_ROUTES",
  Network = "NETWORK",
}

export enum AlertImpact {
  Delayed = "DELAYED",
  PossiblyDelayed = "POSSIBLY_DELAYED",
  ReducedTransport = "REDUCED_TRANSPORT",
  Cancelled = "CANCELLED",
  PossibleDeviations = "POSSIBLE_DEVIATIONS",
  ReturningToNormal = "RETURNING_TO_NORMAL",
  DisruptionRoute = "DISRUPTION_ROUTE",
  DeviatingSchedule = "DEVIATING_SCHEDULE",
  IrregularDepartures = "IRREGULAR_DEPARTURES",
  IrregularDeparturesMax_15 = "IRREGULAR_DEPARTURES_MAX_15",
  IrregularDeparturesMax_30 = "IRREGULAR_DEPARTURES_MAX_30",
  VendingMachineOutOfOrder = "VENDING_MACHINE_OUT_OF_ORDER",
  BicycleStationOutOfOrder = "BICYCLE_STATION_OUT_OF_ORDER",
  BicycleSystemOutOfOrder = "BICYCLE_SYSTEM_OUT_OF_ORDER",
  ReducedBicycleParkCapacity = "REDUCED_BICYCLE_PARK_CAPACITY",
  Other = "OTHER",
  NoTrafficImpact = "NO_TRAFFIC_IMPACT",
  Unknown = "UNKNOWN",
}

export enum AlertLevel {
  Info = "INFO",
  Warning = "WARNING",
  Severe = "SEVERE",
}

export type AreaEventsFilterInput = {
  routeId?: Maybe<Scalars["String"]>;
  direction?: Maybe<Scalars["Direction"]>;
};

export type AreaJourney = {
  id: Scalars["ID"];
  lineId?: Maybe<Scalars["String"]>;
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  departureDate: Scalars["Date"];
  departureTime: Scalars["Time"];
  uniqueVehicleId?: Maybe<Scalars["VehicleId"]>;
  operatorId?: Maybe<Scalars["String"]>;
  vehicleId?: Maybe<Scalars["String"]>;
  headsign?: Maybe<Scalars["String"]>;
  mode?: Maybe<Scalars["String"]>;
  events: Array<Maybe<JourneyEvent>>;
};

export enum CacheControlScope {
  Public = "PUBLIC",
  Private = "PRIVATE",
}

export type Cancellation = {
  id: Scalars["ID"];
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  departureDate: Scalars["Date"];
  journeyStartTime: Scalars["Time"];
  reason?: Maybe<Scalars["String"]>;
  isCancelled?: Maybe<Scalars["Boolean"]>;
};

export type Departure = {
  id: Scalars["ID"];
  stopId: Scalars["String"];
  dayType: Scalars["String"];
  equipmentType?: Maybe<Scalars["String"]>;
  equipmentIsRequired?: Maybe<Scalars["Boolean"]>;
  equipmentColor?: Maybe<Scalars["String"]>;
  operatorId?: Maybe<Scalars["String"]>;
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  terminalTime?: Maybe<Scalars["Int"]>;
  recoveryTime?: Maybe<Scalars["Int"]>;
  departureId: Scalars["Int"];
  extraDeparture: Scalars["String"];
  isNextDay: Scalars["Boolean"];
  isTimingStop: Scalars["Boolean"];
  index?: Maybe<Scalars["Int"]>;
  mode: Scalars["String"];
  stop: RouteSegment;
  journey?: Maybe<DepartureJourney>;
  originDepartureTime?: Maybe<PlannedDeparture>;
  plannedArrivalTime: PlannedArrival;
  observedArrivalTime?: Maybe<ObservedArrival>;
  plannedDepartureTime: PlannedDeparture;
  observedDepartureTime?: Maybe<ObservedDeparture>;
};

export type DepartureFilterInput = {
  routeId?: Maybe<Scalars["String"]>;
  direction?: Maybe<Scalars["Direction"]>;
  minHour?: Maybe<Scalars["Int"]>;
  maxHour?: Maybe<Scalars["Int"]>;
};

export type DepartureJourney = {
  id: Scalars["ID"];
  lineId?: Maybe<Scalars["String"]>;
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  originStopId?: Maybe<Scalars["String"]>;
  departureDate: Scalars["Date"];
  departureTime: Scalars["Time"];
  uniqueVehicleId?: Maybe<Scalars["VehicleId"]>;
  mode?: Maybe<Scalars["String"]>;
  events?: Maybe<Array<JourneyEvent>>;
  _numInstance?: Maybe<Scalars["Int"]>;
};

export type Equipment = {
  id: Scalars["ID"];
  vehicleId: Scalars["String"];
  operatorId: Scalars["String"];
  operatorName?: Maybe<Scalars["String"]>;
  registryNr: Scalars["String"];
  age: Scalars["Int"];
  type: Scalars["String"];
  exteriorColor: Scalars["String"];
  emissionDesc: Scalars["String"];
  emissionClass: Scalars["String"];
  inService?: Maybe<Scalars["Boolean"]>;
  _matchScore?: Maybe<Scalars["Float"]>;
};

export type EquipmentFilterInput = {
  vehicleId?: Maybe<Scalars["String"]>;
  operatorId?: Maybe<Scalars["String"]>;
  search?: Maybe<Scalars["String"]>;
};

export type ExceptionDay = {
  id: Scalars["ID"];
  exceptionDate: Scalars["Date"];
  effectiveDayTypes: Array<Scalars["String"]>;
  dayType: Scalars["String"];
  modeScope?: Maybe<Scalars["String"]>;
  description?: Maybe<Scalars["String"]>;
  exclusive: Scalars["Boolean"];
  startTime?: Maybe<Scalars["Time"]>;
  endTime?: Maybe<Scalars["Time"]>;
};

export type Journey = {
  id: Scalars["ID"];
  lineId?: Maybe<Scalars["String"]>;
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  originStopId?: Maybe<Scalars["String"]>;
  departureDate: Scalars["Date"];
  departureTime: Scalars["Time"];
  uniqueVehicleId?: Maybe<Scalars["VehicleId"]>;
  operatorId?: Maybe<Scalars["String"]>;
  vehicleId?: Maybe<Scalars["String"]>;
  headsign?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  mode?: Maybe<Scalars["String"]>;
  equipment?: Maybe<Equipment>;
  events: Array<JourneyEvent>;
  departures: Array<Departure>;
};

export type JourneyEvent = Position & {
  id: Scalars["ID"];
  receivedAt: Scalars["DateTime"];
  recordedAt: Scalars["DateTime"];
  recordedAtUnix: Scalars["Int"];
  recordedTime: Scalars["Time"];
  nextStopId?: Maybe<Scalars["String"]>;
  lat?: Maybe<Scalars["Float"]>;
  lng?: Maybe<Scalars["Float"]>;
  doorStatus?: Maybe<Scalars["Boolean"]>;
  velocity?: Maybe<Scalars["Float"]>;
  delay?: Maybe<Scalars["Int"]>;
  heading?: Maybe<Scalars["Int"]>;
};

export type Line = {
  id: Scalars["ID"];
  lineId: Scalars["String"];
  name?: Maybe<Scalars["String"]>;
  routesCount?: Maybe<Scalars["Int"]>;
  _matchScore?: Maybe<Scalars["Float"]>;
};

export type LineFilterInput = {
  search?: Maybe<Scalars["String"]>;
  includeLinesWithoutRoutes?: Maybe<Scalars["Boolean"]>;
};

export type ObservedArrival = {
  id: Scalars["ID"];
  arrivalEvent: JourneyEvent;
  arrivalDate: Scalars["Date"];
  arrivalTime: Scalars["Time"];
  arrivalDateTime: Scalars["DateTime"];
  arrivalTimeDifference: Scalars["Int"];
  doorDidOpen: Scalars["Boolean"];
};

export type ObservedDeparture = {
  id: Scalars["ID"];
  departureEvent: JourneyEvent;
  departureDate: Scalars["Date"];
  departureTime: Scalars["Time"];
  departureDateTime: Scalars["DateTime"];
  departureTimeDifference: Scalars["Int"];
};

export type PlannedArrival = {
  id: Scalars["ID"];
  arrivalDate: Scalars["Date"];
  arrivalTime: Scalars["Time"];
  arrivalDateTime: Scalars["DateTime"];
  isNextDay?: Maybe<Scalars["Boolean"]>;
};

export type PlannedDeparture = {
  id: Scalars["ID"];
  departureDate: Scalars["Date"];
  departureTime: Scalars["Time"];
  departureDateTime: Scalars["DateTime"];
  isNextDay?: Maybe<Scalars["Boolean"]>;
};

/** Any object that describes something with a position implements this interface. */
export type Position = {
  lat?: Maybe<Scalars["Float"]>;
  lng?: Maybe<Scalars["Float"]>;
};

export type Query = {
  equipment: Array<Maybe<Equipment>>;
  stop?: Maybe<Stop>;
  stops: Array<Maybe<SimpleStop>>;
  stopsByBbox: Array<Maybe<SimpleStop>>;
  route?: Maybe<Route>;
  routes: Array<Maybe<Route>>;
  routeGeometry?: Maybe<RouteGeometry>;
  routeSegments: Array<Maybe<RouteSegment>>;
  lines: Array<Maybe<Line>>;
  departures: Array<Maybe<Departure>>;
  routeDepartures: Array<Maybe<Departure>>;
  weeklyDepartures: Array<Maybe<Departure>>;
  exceptionDays: Array<Maybe<ExceptionDay>>;
  journey?: Maybe<Journey>;
  journeys: Array<Maybe<Journey>>;
  vehicleJourneys: Array<Maybe<VehicleJourney>>;
  eventsByBbox: Array<Maybe<AreaJourney>>;
  alerts: Array<Maybe<Alert>>;
};

export type QueryEquipmentArgs = {
  filter?: Maybe<EquipmentFilterInput>;
  date?: Maybe<Scalars["Date"]>;
};

export type QueryStopArgs = {
  stopId: Scalars["String"];
  date: Scalars["Date"];
};

export type QueryStopsArgs = {
  filter?: Maybe<StopFilterInput>;
};

export type QueryStopsByBboxArgs = {
  filter?: Maybe<StopFilterInput>;
  bbox: Scalars["BBox"];
};

export type QueryRouteArgs = {
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  date: Scalars["Date"];
};

export type QueryRoutesArgs = {
  filter?: Maybe<RouteFilterInput>;
  line?: Maybe<Scalars["String"]>;
  date?: Maybe<Scalars["Date"]>;
};

export type QueryRouteGeometryArgs = {
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  date: Scalars["Date"];
};

export type QueryRouteSegmentsArgs = {
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  date: Scalars["Date"];
};

export type QueryLinesArgs = {
  filter?: Maybe<LineFilterInput>;
  date?: Maybe<Scalars["Date"]>;
  includeLinesWithoutRoutes: Scalars["Boolean"];
};

export type QueryDeparturesArgs = {
  filter?: Maybe<DepartureFilterInput>;
  stopId: Scalars["String"];
  date: Scalars["Date"];
};

export type QueryRouteDeparturesArgs = {
  stopId: Scalars["String"];
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  date: Scalars["Date"];
};

export type QueryWeeklyDeparturesArgs = {
  stopId: Scalars["String"];
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  date: Scalars["Date"];
};

export type QueryExceptionDaysArgs = {
  year: Scalars["String"];
};

export type QueryJourneyArgs = {
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  departureTime: Scalars["Time"];
  departureDate: Scalars["Date"];
  uniqueVehicleId?: Maybe<Scalars["VehicleId"]>;
};

export type QueryJourneysArgs = {
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  departureDate: Scalars["Date"];
};

export type QueryVehicleJourneysArgs = {
  uniqueVehicleId: Scalars["VehicleId"];
  date: Scalars["Date"];
};

export type QueryEventsByBboxArgs = {
  minTime: Scalars["DateTime"];
  maxTime: Scalars["DateTime"];
  bbox: Scalars["PreciseBBox"];
  date: Scalars["Date"];
  filters?: Maybe<AreaEventsFilterInput>;
};

export type QueryAlertsArgs = {
  time?: Maybe<Scalars["Time"]>;
  queryId?: Maybe<Scalars["String"]>;
  queryType?: Maybe<AlertDistribution>;
};

export type Route = {
  id: Scalars["ID"];
  lineId: Scalars["String"];
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  destination?: Maybe<Scalars["String"]>;
  origin?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  destinationStopId?: Maybe<Scalars["String"]>;
  originStopId: Scalars["String"];
  mode?: Maybe<Scalars["String"]>;
  alerts: Array<Alert>;
  _matchScore?: Maybe<Scalars["Float"]>;
};

export type RouteFilterInput = {
  routeId?: Maybe<Scalars["String"]>;
  direction?: Maybe<Scalars["Direction"]>;
  search?: Maybe<Scalars["String"]>;
};

export type RouteGeometry = {
  id: Scalars["ID"];
  mode?: Maybe<Scalars["String"]>;
  coordinates: Array<RouteGeometryPoint>;
};

export type RouteGeometryPoint = Position & {
  lat: Scalars["Float"];
  lng: Scalars["Float"];
};

export type RouteSegment = Position & {
  id: Scalars["ID"];
  lineId?: Maybe<Scalars["String"]>;
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  originStopId?: Maybe<Scalars["String"]>;
  destination: Scalars["String"];
  distanceFromPrevious?: Maybe<Scalars["Int"]>;
  distanceFromStart?: Maybe<Scalars["Int"]>;
  duration?: Maybe<Scalars["Int"]>;
  stopIndex: Scalars["Int"];
  isTimingStop: Scalars["Boolean"];
  stopId: Scalars["String"];
  shortId: Scalars["String"];
  lat: Scalars["Float"];
  lng: Scalars["Float"];
  name?: Maybe<Scalars["String"]>;
  radius?: Maybe<Scalars["Float"]>;
  modes: Array<Maybe<Scalars["String"]>>;
  alerts: Array<Alert>;
};

export type SimpleStop = Position & {
  id: Scalars["ID"];
  stopId: Scalars["String"];
  shortId: Scalars["String"];
  lat: Scalars["Float"];
  lng: Scalars["Float"];
  name?: Maybe<Scalars["String"]>;
  radius?: Maybe<Scalars["Float"]>;
  modes: Array<Maybe<Scalars["String"]>>;
  _matchScore?: Maybe<Scalars["Float"]>;
  alerts: Array<Alert>;
};

export type Stop = Position & {
  id: Scalars["ID"];
  stopId: Scalars["String"];
  shortId: Scalars["String"];
  lat: Scalars["Float"];
  lng: Scalars["Float"];
  name?: Maybe<Scalars["String"]>;
  radius?: Maybe<Scalars["Float"]>;
  modes: Array<Maybe<Scalars["String"]>>;
  routes: Array<Maybe<StopRoute>>;
  alerts: Array<Alert>;
};

export type StopFilterInput = {
  search?: Maybe<Scalars["String"]>;
};

export type StopRoute = {
  id: Scalars["ID"];
  originStopId?: Maybe<Scalars["String"]>;
  lineId?: Maybe<Scalars["String"]>;
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  isTimingStop: Scalars["Boolean"];
  mode?: Maybe<Scalars["String"]>;
};

export type VehicleJourney = {
  id: Scalars["ID"];
  lineId?: Maybe<Scalars["String"]>;
  routeId: Scalars["String"];
  direction: Scalars["Direction"];
  originStopId?: Maybe<Scalars["String"]>;
  departureDate: Scalars["Date"];
  departureTime: Scalars["Time"];
  uniqueVehicleId?: Maybe<Scalars["VehicleId"]>;
  operatorId?: Maybe<Scalars["String"]>;
  vehicleId?: Maybe<Scalars["String"]>;
  headsign?: Maybe<Scalars["String"]>;
  mode?: Maybe<Scalars["String"]>;
  receivedAt: Scalars["DateTime"];
  recordedAt: Scalars["DateTime"];
  recordedAtUnix: Scalars["Int"];
  recordedTime: Scalars["Time"];
  timeDifference: Scalars["Int"];
  nextStopId: Scalars["String"];
  alerts: Array<Alert>;
};
