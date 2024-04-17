var readlineSync = require("readline-sync")
var readline = require("readline")
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
var clientAir = new air_pollution_proto.AirPollutionService("0.0.0.0:40001", grpc.credentials.createInsecure())
var clientWater = new water_pollution_proto.WaterPollutionService("0.0.0.0:40002", grpc.credentials.createInsecure())
var clientWeather = new weather_station_proto.WeatherStationService("0.0.0.0:40003", grpc.credentials.createInsecure())

console.log("Select a service to use:")
console.log("1. Air Pollution Service")
console.log("2. Water Pollution Service")
console.log("3. Weather Station Service")
var choice = parseInt(readlineSync.question("Enter your number choice: "))

switch (choice) {
    case 1:
      //Air Pollution service
      console.log("Select a function to use:")
      console.log("1. Record Air Pollution Data")
      console.log("2. View Historical Pollution Data")
      console.log("3. Check Sensor")
      var option1 = parseInt(readlineSync.question("Enter your number choice: "))

      switch (option1) {
        case 1:
          //Bidirectional Streaming RPC StreamAirPollutionData
          var call = clientWater.StreamAirPollutionData({location: location, pollutionLevel: pollutionLevel})
          call.on('data', function(response){
            console.log(response.location + " recorded a pollution level of " + response.pollutionLevel + ". " + response.message)
          })
          call.on('end', function(){

          })
          call.on('error', function(error){
            console.log("An Error Occurred. Camera flash was off, please try again.", error)
          })
          var location = readlineSync.question("Where is this survey for? ")
          console.log("What is the pollution level? (Type q to quit)")
          var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })
          rl.on('line', function(pollutionLevel){
            if(pollutionLevel.toLowerCase === "q"){
              call.end()
              rl.close()
            } else{
              call.write({
                location: location,
                pollutionLevel: parseFloat(pollutionLevel)
              })
            }
          })
          break;

        case 2:
          //Server Streaming RPC GetHistoricalAirPollutionData
          var location = readlineSync.question("Please enter location: ")
          var days = parseInt(readlineSync.question("How many days of historical data do you wish to generate: "))
          var call = clientAir.GetHistoricalAirPollutionData({location: location, days: days})

          call.on('data', function(response) {
            console.log("Record Data:  " + response.airData)
          })
          call.on('end', function(){
            console.log("Server Connection Ended")
          })
          call.on('error', function(error){
            console.log("An Error Occurred. Mercury is in retrograde.", error)
          })
          break;

        case 3:
          //Unary RPC ConfigureAirSensorSettings
          var location = readlineSync.question("Please enter location: ")
          clientAir.ConfigureAirSensorSettings({location: location}, function(error, response){
            if(error){
              console.error("Error: ", error)
            } else{
              try {
                console.log("Result: " + response.result + " Last Inspection Date: " + response.lastInspection)
              } catch (error) {
                console.log("Could not connect to server. Server gone fishing.", error)
              }
            }
          })
          break;

        default:
          console.log("Invalid choice. Please select from options 1, 2, or 3.")
          break;
        }
        break;

    case 2:
      // Water Pollution Service
      console.log("Select a function to use:")
      console.log("1. Record Water Pollution Data")
      console.log("2. View Historical Pollution Data")
      console.log("3. Check Sensor")
      var option2 = parseInt(readlineSync.question("Enter your number choice: "))

      switch (option2){
        case 1:
          //Bidirectional Streaming RPC StreamWaterPollutionData
          var call = clientWater.StreamWaterPollutionData()
          call.on('data', function(response){
            console.log(response.location + " recorded a pollution level of " + response.pollutionLevel + ". " + response.message)
          })
          call.on('end', function(){

          })
          call.on('error', function(error){
            console.log("An Error Occurred", error)
          })
          var location = readlineSync.question("Where is this survey for? ")
          console.log("What is the pollution level? (Type q to quit)")
          var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })
          rl.on('line', function(pollutionLevel){
            if(pollutionLevel.toLowerCase === "q"){
              call.end()
              rl.close()
            } else{
              call.write({
                location: location,
                pollutionLevel: parseFloat(pollutionLevel)
              })
            }
          })
          break;

        case 2:
          //Server Streaming RPC GetHistoricalWaterPollutionData
          var location = readlineSync.question("Please enter location: ")
          var days = parseInt(readlineSync.question("How many days of historical data do you wish to generate: "))
          var call = clientWater.GetHistoricalWaterPollutionData({location: location, days: days})

          call.on('data', function(response) {
            console.log("Record Data:  " + response.waterData)
          })
          call.on('end', function(){
            console.log("Server Connection Ended")
          })
          call.on('error', function(error){
            console.log("An Error Occurred. Wonder how that happened...", error)
          })
          break;

        case 3:
          //Unary RPC ConfigureWaterSensorSettings
          clientWater.ConfigureWaterSensorSettings({location: location}, function(error, response){
            console.log(response)
            if(error){
              console.error("Error: ", error)
            } else{
              try {
                if(response.message){
                  console.log(response.message)
                } else{
                  console.log("Result: ", response.result, "Last Inspection Date: ", response.lastInspection)
                }
              } catch (error) {
                console.log("Could not connect to server. Left keys at home.", error)
              }
            }
          })
          break;

        default:
          console.log("Invalid choice. Please select from options 1, 2, or 3.")
          break;

      }
      break;
    case 3:
      // Weather Station Service
      console.log("Select a function to use:")
      console.log("1. Record Weather Data")
      console.log("2. View Historical Weather Data")
      console.log("3. Check Sensor")
      var option3 = parseInt(readlineSync.question("Enter your number choice: "))

      switch (option3){
        case 1:
            //Client Streaming RPC PublishWeatherData
            var call = clientWeather.PublishWeatherData(function(error, response){
              if(error){
                console.log("An error occured")
              } else {
                console.log("From the input data, the average temperature is " + response.averageTemperature + " and the average humidity is " + response.averageHumidity)
              }
            })

            var temperature_input
            var humidity_input
            var user_input

            while(true){
              temperature_input = readlineSync.question("Enter temperature: ")
              humidity_input = readlineSync.question("Enter humidity: ")
              user_input = readlineSync.question("End entries? Y/N ")
              if(user_input.toLowerCase() === "y"){
                break
              }
              call.write({ temperature: parseFloat(temperature_input), humidity: parseFloat(humidity_input)})
            }
            call.end()
            break;

        case 2:
            //Server Streaming RPC GetHistoricalWeatherData
            var location = readlineSync.question("Please enter location: ")
            var days = parseInt(readlineSync.question("How many days of historical data do you wish to generate: "))
            var call = clientAir.GetHistoricalWeatherData({location: location, days: days})

            call.on('data', function(response) {
              console.log("Record Data:  " + response.weatherData)
            })
            call.on('end', function(){
              console.log("Server Connection Ended")
            })
            call.on('error', function(error){
              console.log("An Error Occurred. That's not supposed to happen...", error)
            })
            break;

        case 3:
            //Unary RPC ConfigureWaterSensorSettings
            clientWeather.ConfigureStationSettings({location: location}, function(error, response){
              if(error){
                console.error("Error: ", error)
              } else{
                try {
                  if(response.message){
                    console.log(response.message)
                  } else{
                    console.log("Result: " + response.result + " Last Inspection Date: " + response.lastInspection)
                  }
                } catch (error) {
                  console.log("Could not connect to server. Must be this tall to enter.", error)
                }
              }
            })
            break;

        default:
          console.log("Invalid choice. Please select from options 1, 2, or 3.")
          break;
      }
      break;

      default:
        console.log("Invalid choice. Please select from options 1, 2, or 3.")
  }
