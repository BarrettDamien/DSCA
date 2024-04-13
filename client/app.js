var readlineSync = require("readline-sync")
var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")
var PROTO_PATH = __dirname + "/protos/pollution.proto"
var packageDefinition = protoLoader.loadSync(PROTO_PATH)
var pollution_proto = grpc.loadPackageDefinition(packageDefinition).DSCA

var clientAir = new pollution_proto.AirPollutionService("0.0.0.0:40001", grpc.credentials.createInsecure())
var clientWater = new pollution_proto.WaterPollutionService("0.0.0.0:40002", grpc.credentials.createInsecure())
var clientWeather = new pollution_proto.WeatherStationService("0.0.0.0:40003", grpc.credentials.createInsecure())

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
          var location = readlineSync.question("Please enter location. ")
          var pollution_level = parseFloat(readlineSync.question("Please enter the pollution level for this location. "))

          clientAir.StreamAirPollutionData({location: location, pollution_level: pollution_level}, function(error, response){
            if(error){
              console.error("Error: ", error)
            } else{
              try {
                if(response.message){
                  console.log(response.message)
                } else{
                  console.log(response.success)
                }
              } catch (e) {
                console.log("Could not connect to server", e)
              }
            }
          })
          break;
        case 2:
          //Server Streaming RPC GetHistoricalAirPollutionData
          break;

        case 3:
          //Unary RPC ConfigureAirSensorSettings
          clientAir.ConfigureAirSensorSettings({location: location}, function(error, response){
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
          break;

        case 2:
          //Server Streaming RPC GetHistoricalWaterPollutionData
          break;

        case 3:
          //Unary RPC ConfigureWaterSensorSettings
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
            break;

        case 2:
            //Server Streaming RPC GetHistoricalWaterPollutionData
            break;

        case 3:
            //Unary RPC ConfigureWaterSensorSettings
            break;

        default:
          console.log("Invalid choice. Please select from options 1, 2, or 3.")
          break;
      }
      break;
      
      default:
        console.log("Invalid choice. Please select from options 1, 2, or 3.")
  }
