const express = require('express');
const router = express.Router();
const app = express();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const AIR_PROTO_PATH = __dirname + "/protos/air_pollution.proto"
const WATER_PROTO_PATH = __dirname + "/protos/water_pollution.proto"
const WEATHER_PROTO_PATH = __dirname + "/protos/weather_station.proto"
const packageDefinitionAir = protoLoader.loadSync(AIR_PROTO_PATH)
const packageDefinitionWater = protoLoader.loadSync(WATER_PROTO_PATH)
const packageDefinitionWeather = protoLoader.loadSync(WEATHER_PROTO_PATH)
const air_pollution_proto = grpc.loadPackageDefinition(packageDefinitionAir).DSCA
const water_pollution_proto = grpc.loadPackageDefinition(packageDefinitionWater).DSCA
const weather_station_proto = grpc.loadPackageDefinition(packageDefinitionWeather).DSCA
const clientAir = new air_pollution_proto.AirPollutionService("0.0.0.0:40001", grpc.credentials.createInsecure())
const clientWater = new water_pollution_proto.WaterPollutionService("0.0.0.0:40002", grpc.credentials.createInsecure())
const clientWeather = new weather_station_proto.WeatherStationService("0.0.0.0:40003", grpc.credentials.createInsecure())

// Define routes for each service
//Route for StreamAirPollutionData
router.post('/recordAirPollutionData', (req, res) => {
  const {location, pollutionLevel} = req.body

  // Make gRPC call to record air pollution data
  const call = clientAir.StreamAirPollutionData({ location, pollution_level: pollutionLevel })

  // Handle responses from the server
  call.on('data', (response) => {
    console.log(response.location + " recorded a pollution level of " + response.pollution_level + ". " + response.message)
    // Respond to the client with a success message
    res.status(200).send("Air pollution data recorded successfully.")
  });

  call.on('end', () => {
    // Handle end of stream
    // Respond to the client if needed
  });

  call.on('error', (error) => {
    // Handle errors
    console.log("An Error Occurred. Camera flash was off, please try again.", error)
    // Respond to the client with an error message
    res.status(500).send("An error occurred while recording air pollution data.")
  });
});

module.exports = router;
