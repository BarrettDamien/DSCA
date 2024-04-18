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
var sensorLocation = {}
var pollutionMetrics = {}
var highestPollution = 0
var message = null

//Air Pollution Functions
function StreamAirPollutionData(call){
  const timeout = setTimeout(() => {
    call.cancel()
  }, 5000)
  call.on('data', function(data){
    clearTimeout(timeout)
    try{
      const {location, pollutionLevel} = data
      if(!(data.location in sensorLocation)){
        sensorLocation[data.location] = {
          location: data.location,
          call: call
        }
      }
      if(data.pollutionLevel > highestPollution || !message){
        highestPollution = data.pollutionLevel
        message = data.location + " recorded a pollution level of " + data.pollutionLevel + ". " + "Highest recorded pollution level is in " + data.location
      }
      for(var sensor in sensorLocation){
        sensorLocation[sensor].call.write({
          pollutionLevel: data.pollutionLevel,
          location: data.location,
          message: message
        })
      }
    } catch (error) {
      console.error('Error processing air pollution data:', error.message)
      call.emit('error', {
        code: grpc.status.UNKNOWN,
        message: 'An error occurred while processing air pollution data.'
      })
    }
  })
  call.on('end', function(){
    clearTimeout(timeout)
    call.end()
  })
  call.on('error', function(error){
    clearTimeout(timeout)
    console.error('Error in air pollution data stream:', error.message)
  })
}

function GetHistoricalAirPollutionData(call){
  try {
        const { location, days } = call.request
        for (var i = 0; i < days; i++) {
            var airData = Math.round(Math.random() * 25) + 5;
            call.write({
                airData: airData
            })
        }
        call.end()

    } catch (error) {
        console.error('Error retrieving historical air pollution data:', error.message);
        call.emit('error', {
            code: grpc.status.UNKNOWN,
            message: 'An error occurred while retrieving historical air pollution data.'
        });
    }
}

function ConfigureAirSensorSettings(call, callback) {
    try {
        const {location} = call.request
        const lastInspection = "09/04/2024"
        const result = randomSuccess() ? "Sensor Online" : "Sensor Offline"
        callback(null, {result, lastInspection})
    } catch (error) {
        console.error('Error configuring air sensor settings:', error.message);
        callback({
            code: grpc.status.UNKNOWN,
            message: 'An error occurred while configuring air sensor settings.'
        });
    }
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
  const timeout = setTimeout(() => {
    call.cancel()
  }, 5000)
  call.on('data', function(data){
    clearTimeout(timeout)
    try{
      const {location, pollutionLevel} = data
      if(!(data.location in sensorLocation)){
        sensorLocation[data.location] = {
          location: data.location,
          call: call
        }
      }
      if(data.pollutionLevel > highestPollution || !message){
        highestPollution = data.pollutionLevel
        message = "Highest recorded pollution level is in " + data.location
      }
      for(var sensor in sensorLocation){
        sensorLocation[sensor].call.write({
          pollutionLevel: data.pollutionLevel,
          location: data.location,
          message: message
        })
      }
    } catch (error) {
      console.error('Error processing water pollution data:', error.message)
      call.emit('error', {
        code: grpc.status.UNKNOWN,
        message: 'An error occurred while processing water pollution data.'
      })
    }
  })
  call.on('end', function(){
    clearTimeout(timeout)
    call.end()
  })
  call.on('error', function(error){
    clearTimeout(timeout)
    console.error('Error in water pollution data stream:', error.message)
  })
}

function GetHistoricalWaterPollutionData(call, callback){
  try {
        const { location, days } = call.request
        for (var i = 0; i < days; i++) {
            var waterData = Math.round(Math.random() * 25) + 5;
            call.write({
                waterData: waterData
            })
        }
        call.end()
    } catch (error) {
        console.error('Error retrieving historical water pollution data:', error.message);
        call.emit('error', {
            code: grpc.status.UNKNOWN,
            message: 'An error occurred while retrieving historical water pollution data.'
        });
    }
}

function ConfigureWaterSensorSettings(call, callback){
  try {
      const {location} = call.request
      const lastInspection = "09/04/2024"
      const result = randomSuccess() ? "Sensor Online" : "Sensor Offline"
      callback(null, {result:result, lastInspection:lastInspection})
  } catch (error) {
      console.error('Error configuring water sensor settings:', error.message);
      callback({
          code: grpc.status.UNKNOWN,
          message: 'An error occurred while configuring water sensor settings.'
      });
  }
}

//Weather Station Functions
function PublishWeatherData(call, callback){
  var count = 0
  var tempSum = 0
  var humidSum = 0

  call.on('data', function(request){
    tempSum += request.temperature
    humidSum += request.humidity
    count += 1
  })
  call.on('end', function(){
    callback(null, {averageTemperature: tempSum/count, averageHumidity: humidSum/count})
  })
  call.on('error', function(error){
    console.log("An error occured. Allergy season hit hard.")
  })
}

function GetHistoricalWeatherData(call, callback){
  try {
        const {location, days} = call.request
        for (var i = 0; i < days; i++) {
            var weatherData = Math.round(Math.random() * 25) + 5;
            call.write({
                weatherData: weatherData
            })
        }
        call.end()
    } catch (error) {
        console.error('Error retrieving historical air pollution data:', error.message);
        call.emit('error', {
            code: grpc.status.UNKNOWN,
            message: 'An error occurred while retrieving historical air pollution data.'
        });
    }

}

function ConfigureStationSettings(call, callback){
  try {
      const {location} = call.request
      const lastInspection = "09/04/2024"
      const result = randomSuccess() ? "Sensor Online" : "Sensor Offline"
      callback(null, {result, lastInspection})
  } catch (error) {
      console.error('Error configuring weather station sensor settings:', error.message);
      callback({
          code: grpc.status.UNKNOWN,
          message: 'An error occurred while configuring weather station sensor settings.'
      });
  }
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
