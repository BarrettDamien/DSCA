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
          // var location = readlineSync.question("Where is this survey for? ")
          // var call = clientAir.StreamAirPollutionData()
          //
          // call.on('data', function(response){
          //   console.log(response.location + " recorded a pollution level of " + response.pollutionLevel + ". ")
          // })
          // call.on('end', function(){
          //   console.log('Server has ended the connection')
          // })
          // call.on('error', function(error){
          //   console.log("An Error Occurred", error)
          // })
          // call.write({
          //   message: location + " pollution data recording started.",
          //   location: location
          // })
          // console.log("What is the pollution level? (Type q to quit) ")
          // var rl = readline.createInterface({
          //     input: process.stdin,
          //     output: process.stdout
          // })
          // rl.on('line', function(pollutionLevel){
          //   if(pollutionLevel.toLowerCase === "q"){
          //     call.write({
          //       pollutionLevel: location + " pollution data recording ended.",
          //       location: location
          //     })
          //     call.end()
          //     rl.close()
          //   } else{
          //     call.write({
          //       pollutionLevel: parseFloat(pollutionLevel),
          //       location: location
          //     })
          //   }
          // })
          var call = clientAir.StreamAirPollutionData()
          call.on('data', function(response){
            console.log(response.location + " recorded a pollution level of " + response.pollutionLevel + ". ")
          })
          call.on('end', function(){
            console.log('Server has ended the connection')
          })
          call.on('error', function(error){
            console.log("An Error Occurred", error)
          })
          var sensor = readlineSync.question("Where is this survey for? ")
          console.log("What is the pollution level? (Type q to quit) ")
          var rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout
          })
          rl.on('line', function(pollutionLevel){
            if(pollutionLevel.toLowerCase === "q"){
              console.log("Pollution data recording ended.")
              call.end()
              rl.close()
            } else{
              call.write({
                location: sensor,
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

            var temperatureInput
            var humidityInput
            var userInput

            while(true){
              temperatureInput = readlineSync.question("Enter temperature: ")
              humidityInput = readlineSync.question("Enter humidity: ")
              userInput = readlineSync.question("End entries? Y/N ")
              if(userInput.toLowerCase() === "y"){
                break
              }
              call.write({ temperature: parseFloat(temperatureInput), humidity: parseFloat(humidityInput)})
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
