var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/pollution.proto"
//var WATER_PROTO_PATH = __dirname + "/protos/water_pollution.proto"
//var WEATHER_PROTO_PATH = __dirname + "/protos/weather_station.proto"
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
//var packageDefinitionWater = protoLoader.loadSync(WATER_PROTO_PATH)
//var packageDefinitionWeather = protoLoader.loadSync(WEATHER_PROTO_PATH)
var pollution_proto = grpc.loadPackageDefinition(packageDefinition).DSCA
//var water_pollution_proto = grpc.loadPackageDefinition(packageDefinitionWater)
//var weather_station_proto = grpc.loadPackageDefinition(packageDefinitionWeather)

//Air Pollution Functions
function StreamAirPollutionData(call, callback){

}

function GetHistoricalAirPollutionData(call, callback){

}

function ConfigureAirSensorSettings(call, callback){

}

//Water Pollution Functions
function StreamWaterPollutionData(call, callback){

}

function GetHistoricalWaterPollutionData(call, callback){

}

function ConfigureWaterSensorSettings(call, callback){

}

//Weather Station Functions
function PublishWeatherData(call, callback){

}

function GetHistoricalWeatherData(call, callback){

}

function ConfigureStationSettings(call, callback){

}

//Create Air Pollution Server
var serverAir = new grpc.Server()
serverAir.addService(pollution_proto.AirPollutionService.service, {StreamAirPollutionData: StreamAirPollutionData, GetHistoricalAirPollutionData: GetHistoricalAirPollutionData, ConfigureAirSensorSettings: ConfigureAirSensorSettings})
serverAir.bindAsync("0.0.0.0:40001", grpc.ServerCredentials.createInsecure(), function() {
  serverAir.start()
})

//Create Water Pollution Server
var serverWater = new grpc.Server()
serverWater.addService(pollution_proto.WaterPollutionService.service, {StreamWaterPollutionData: StreamWaterPollutionData, GetHistoricalWaterPollutionData: GetHistoricalWaterPollutionData, ConfigureWaterSensorSettings: ConfigureWaterSensorSettings})
serverWater.bindAsync("0.0.0.0:40002", grpc.ServerCredentials.createInsecure(), function() {
  serverWater.start()
})

//Create Weather Station Server
var serverWeather = new grpc.Server()
serverWeather.addService(pollution_proto.WeatherStationService.service, {PublishWeatherData: PublishWeatherData, GetHistoricalWeatherData: GetHistoricalWeatherData, ConfigureStationSettings: ConfigureStationSettings})
serverWeather.bindAsync("0.0.0.0:40003", grpc.ServerCredentials.createInsecure(), function() {
  serverWeather.start()
})
