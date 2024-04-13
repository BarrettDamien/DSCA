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
var today = new Date().toISOString().slice(0,10)
//var inspection_Date = new Date(today)
//inspection_Date.setDate(today.getDate()-45)

var randomSuccess = () => Math.random() >= 0.5

//Air Pollution Functions
function StreamAirPollutionData(call, callback){
  try {
    var location = parse(call.request.location)
    var pollution_level = parseFloat(call.request.pollution_level)
    if(isNaN(location) && !isNaN(pollution_level)){
      var success = "Data Received and Logged"
      callback(null, {
        message: undefined,
        success: success
      })
    } else{
      callback(null, {
        message: "Please enter a valid location and pollution level"
      })
    }
  } catch(e) {
    callback(null, {
      message: "An error occured"
    })
  }
}

function GetHistoricalAirPollutionData(call, callback){

}

function ConfigureAirSensorSettings(call, callback){
  try {
    var location = parse(call.request.location)
    if(isNaN(location) && randomSuccess == true){
      var result = "Sensor Online"
      var inspection_Date = new Date(today)
      inspection_Date.setDate(today.getDate()-15)
      callback(null, {
        message: undefined,
        success: result,
        last_inspection: inspection_Date.toISOString().slice(0,10)
      })
    } else if(isNaN(location) && randomSuccess == false){
      var result = "Sensor Offline"
      var inspection_Date = new Date(today)
      inspection_Date.setDate(today.getDate()-45)
      callback(null, {
        message: undefined,
        success: result,
        last_inspection: inspection_Date.toISOString().slice(0,10)
      })
    } else {
      callback(null, {
        message: "Please enter a valid location"
      })
    }
  } catch(e) {
    callback(null, {
      message: "An error occured"
    })
  }
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
