var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var AIR_PROTO_PATH = __dirname + "/protos/air_pollution.proto"
var WATER_PROTO_PATH = __dirname + "/protos/water_pollution.proto"
var WEATHER_PROTO_PATH = __dirname + "/protos/weather_station.proto"
var packageDefinitionAir = protoLoader.loadSync(AIR_PROTO_PATH)
var packageDefinitionWater = protoLoader.loadSync(WATER_PROTO_PATH)
var packageDefinitionWeather = protoLoader.loadSync(WEATHER_PROTO_PATH)
var air_pollution_proto = grpc.loadPackageDefinition(packageDefinitionAir).DSCA
var water_pollution_proto = grpc.loadPackageDefinition(packageDefinitionWater).DSCA
var weather_station_proto = grpc.loadPackageDefinition(packageDefinitionWeather).DSCA

//Unary Vars
var today = new Date().toISOString().slice(0,10)
var randomSuccess = () => Math.random() >= 0.5

//Bidirection Vars
var sensor_location = {}
var pollution_metrics = {}
var highest_pollution = 0
var message = null

//Air Pollution Functions
function StreamAirPollutionData(call){
  call.on('data', function(data){
    const {location, pollution_level} = data
    if(!(pollution_level.location in sensor_location)){
      sensor_location[pollution_level.location] = {
        location: pollution_level.location,
        call: call
      }
    }
    if(!(pollution_level.location in sensor_location)){
      sensor_location[pollution_level.location] = 0
    }
    sensor_location[pollution_level.location] += 1
    if(pollution_level.pollution_level > highest_pollution || !message){
      highest_pollution = pollution_level.pollution_level
      message = "Highest recorded pollution level is in " + pollution_level.location
    }
    for(var sensor in sensor_location){
      sensor_location[sensor].call.write({
        pollution_level: pollution_level.pollution_level,
        location: pollution_level.location,
        message: message
      })
    }
  })
  call.on('end', function(){
    call.end()
  })
  call.on('error', function(e){
    console.log(e)
  })
}

function GetHistoricalAirPollutionData(call){
  try {
    // var location = call.request.location
    // var days = parseInt(call.request.days)
    const {location, days} = call.request
    for(var i = 0; i < days; i++){
      var air_data = Math.round(Math.random() * 25) + 5;
      call.write({
        air_data: air_data
      })
    }
    call.end()

  } catch(e) {
    callback(null, {
      message: "An error occured"
    })
  }
}

function ConfigureAirSensorSettings(call, callback){
    const {location} = call.request
    const last_inspection = "09/04/2024"
    const result = randomSuccess() ? "Sensor Online" : "Sensor Offline"
    callback(null, {result, last_inspection})
  //   if(randomSuccess()){
  //     var result = "Sensor Online"
  //     // var inspection_Date = new Date(today);
  //     // inspection_Date.setDate(inspection_Date.getDate()-15)
  //     callback(null, {result: result, last_inspection: last_inspection})
  //       //inspection_Date.toISOString().slice(0,10)
  //
  //   } else if(!randomSuccess()){
  //     var result = "Sensor Offline"
  //     // var inspection_Date = new Date(today);
  //     // inspection_Date.setDate(inspection_Date.getDate()-45)
  //     callback(null, {result: result, last_inspection: last_inspection})
  //   } else {
  //     callback(null, {message: "Please enter a valid location"})
  //   }
  // }
}

//Water Pollution Functions
function StreamWaterPollutionData(call){
  call.on('data', function(data){
    const {location, pollution_level} = data
    if(!(pollution_level.location in sensor_location)){
      sensor_location[pollution_level.location] = {
        location: pollution_level.location,
        call: call
      }
    }
    if(!(pollution_level.location in sensor_location)){
      sensor_location[pollution_level.location] = 0
    }
    sensor_location[pollution_level.location] += 1
    if(pollution_level.pollution_level > highest_pollution || !message){
      highest_pollution = pollution_level.pollution_level
      message = "Highest recorded pollution level is in " + pollution_level.location
    }
    for(var sensor in sensor_location){
      sensor_location[sensor].call.write({
        pollution_level: pollution_level.pollution_level,
        location: pollution_level.location,
        message: message
      })
    }
  })
  call.on('end', function(){
    call.end()
  })
  call.on('error', function(e){
    console.log(e)
  })
}

function GetHistoricalWaterPollutionData(call, callback){
  try {
    const {location, days} = call.request
    for(var i = 0; i < days; i++){
      var water_data = Math.round(Math.random() * 25) + 5;
      call.write({
        water_data: water_data
      })
    }
    call.end()

  } catch(e) {
    callback(null, {
      message: "An error occured"
    })
  }
}

function ConfigureWaterSensorSettings(call, callback){
  const {location} = call.request
  const last_inspection = "09/04/2024"
  const result = randomSuccess() ? "Sensor Online" : "Sensor Offline"
  callback(null, {result, last_inspection})
}

//Weather Station Functions
function PublishWeatherData(call, callback){
  var count = 0
  var temp_sum = 0
  var humid_sum = 0

  call.on('data', function(request){
    temp_sum += request.temperature
    humid_sum += request.humidity
    count += 1
  })
  call.on('end', function(){
    callback(null, {average_temperature: temp_sum/count, average_humidity: humid_sum/count})
  })
  call.on('error', function(e){
    console.log("An error occured")
  })
}

function GetHistoricalWeatherData(call, callback){
  try {
    var location = call.request.location
    var days = parseInt(call.request.days)

    for(var i = 0; i < days; i++){
      var weather_data = Math.round(Math.random() * 25) + 5;
      call.write({
        weather_data: weather_data
      })
    }
    call.end()

  } catch(e) {
    callback(null, {
      message: "An error occured"
    })
  }
}

function ConfigureStationSettings(call, callback){
  const {location} = call.request
  const last_inspection = "09/04/2024"
  const result = randomSuccess() ? "Sensor Online" : "Sensor Offline"
  callback(null, {result, last_inspection})
}

//Create Air Pollution Server
var serverAir = new grpc.Server()
serverAir.addService(air_pollution_proto.AirPollutionService.service, {StreamAirPollutionData: StreamAirPollutionData, GetHistoricalAirPollutionData: GetHistoricalAirPollutionData, ConfigureAirSensorSettings: ConfigureAirSensorSettings})
serverAir.bindAsync("0.0.0.0:40001", grpc.ServerCredentials.createInsecure(), function() {
  serverAir.start()
})

//Create Water Pollution Server
var serverWater = new grpc.Server()
serverWater.addService(water_pollution_proto.WaterPollutionService.service, {StreamWaterPollutionData: StreamWaterPollutionData, GetHistoricalWaterPollutionData: GetHistoricalWaterPollutionData, ConfigureWaterSensorSettings: ConfigureWaterSensorSettings})
serverWater.bindAsync("0.0.0.0:40002", grpc.ServerCredentials.createInsecure(), function() {
  serverWater.start()
})

//Create Weather Station Server
var serverWeather = new grpc.Server()
serverWeather.addService(weather_station_proto.WeatherStationService.service, {PublishWeatherData: PublishWeatherData, GetHistoricalWeatherData: GetHistoricalWeatherData, ConfigureStationSettings: ConfigureStationSettings})
serverWeather.bindAsync("0.0.0.0:40003", grpc.ServerCredentials.createInsecure(), function() {
  serverWeather.start()
})
