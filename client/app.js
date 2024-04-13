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
          var call = clientWater.StreamAirPollutionData({location: location, pollution_level: pollution_level})
          call.on('data', function(response){
            console.log(response.location + " recorded a pollution level of " + response.pollution_level + ". " + response.message)
          })
          call.on('end', function(){

          })
          call.on('error', function(e){
            console.log("An Error Occurred", e)
          })
          var location = readlineSync.question("Where is this survey for? ")
          console.log("What is the pollution level? (Type q to quit)")
          var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })
          rl.on('line', function(pollution_level){
            if(pollution_level.toLowerCase === "q"){
              call.end()
              rl.close()
            } else{
              call.write({
                location: location,
                pollution_level: parseFloat(pollution_level)
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
            console.log("Record Data:  " + response.air_data)
          })
          call.on('end', function(){
            console.log("Server Connection Ended")
          })
          call.on('error', function(e){
            console.log("An Error Occurred", e)
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
                console.log("Result: " + response.result + " Last Inspection Date: " + response.inspection_Date)
              } catch (e) {
                console.log("Could not connect to server", e)
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
            console.log(response.location + " recorded a pollution level of " + response.pollution_level + ". " + response.message)
          })
          call.on('end', function(){

          })
          call.on('error', function(e){
            console.log("An Error Occurred", e)
          })
          var location = readlineSync.question("Where is this survey for? ")
          console.log("What is the pollution level? (Type q to quit)")
          var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })
          rl.on('line', function(pollution_level){
            if(pollution_level.toLowerCase === "q"){
              call.end()
              rl.close()
            } else{
              call.write({
                location: location,
                pollution_level: parseFloat(pollution_level)
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
            console.log("Record Data:  " + response.water_data)
          })
          call.on('end', function(){
            console.log("Server Connection Ended")
          })
          call.on('error', function(e){
            console.log("An Error Occurred", e)
          })
          break;

        case 3:
          //Unary RPC ConfigureWaterSensorSettings
          clientWater.ConfigureWaterSensorSettings({location: location}, function(error, response){
            if(error){
              console.error("Error: ", error)
            } else{
              try {
                if(response.message){
                  console.log(response.message)
                } else{
                  console.log("Result: ", response.result, "Last Inspection Date: ", response.inspection_Date)
                }
              } catch (e) {
                console.log("Could not connect to server", e)
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
                console.log("From the input data, the average temperature is " + response.average_temperature + " and the average humidity is " + response.average_humidity)
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
              console.log("Record Data:  " + response.weather_data)
            })
            call.on('end', function(){
              console.log("Server Connection Ended")
            })
            call.on('error', function(e){
              console.log("An Error Occurred", e)
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
                    console.log("Result: " + response.result + " Last Inspection Date: " + response.inspection_Date)
                  }
                } catch (e) {
                  console.log("Could not connect to server", e)
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
