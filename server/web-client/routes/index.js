const express = require('express')
const router = express.Router()
const app = express()
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
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
router.post('/streamAirPollutionData', (req, res) => {
  const { location, pollutionLevel } = req.body;
    // Bidirectional Streaming RPC StreamAirPollutionData
    const call = clientAir.StreamAirPollutionData()
    call.on('data', (response) => {
        console.log(`${response.location} recorded a pollution level of ${response.pollution_level}. ${response.message}`);
    });
    call.on('end', () => {
        console.log("Server Connection Ended");
        res.status(200).send("Server Connection Ended");
    });
    call.on('error', (error) => {
        console.error("An Error Occurred", error);
        res.status(500).send("An Error Occurred");
    });
    //Get user input for location and pollution level
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Where is this survey for? ", (location) => {
        rl.question("What is the pollution level? (Type q to quit)", (pollution_level) => {
            if (pollution_level.toLowerCase() === "q") {
                call.end();
                rl.close();
            } else {
                call.write({
                    location: location,
                    pollution_level: parseFloat(pollution_level)
                })
            }
        })
    })
})
//Route for GetHistoricalAirPollutionData
router.post('/getHistoricalAirPollutionData', (req, res) => {
  const {location, days} = req.body
    //Server Streaming RPC GetHistoricalAirPollutionData
    const call = clientAir.GetHistoricalAirPollutionData({location, days})
    call.on('data', (response) => {
        console.log("Record Data:  " + response.air_data)
        res.status(200).send(response.air_data);
    });
    call.on('end', () => {
        console.log("Server Connection Ended")
        res.status(200).send("Server Connection Ended")
    });
    call.on('error', (error) => {
        console.log("An Error Occurred. Mercury is in retrograde.", error)
        res.status(500).send("An error occurred while getting historical air pollution data.")
    });
})
//Route for ConfigureAirSensorSettings
router.post('/configureAirSensorSettings', (req, res) => {
  const { location } = req.body;
    //Unary RPC ConfigureAirSensorSettings
    clientAir.ConfigureAirSensorSettings({ location }, (error, response) => {
        if (error) {
            console.error("Error: ", error)
            res.status(500).send("An error occurred while configuring air sensor settings.")
        } else {
            try {
                console.log("Result: " + response.result + " Last Inspection Date: " + response.last_inspection)
                res.status(200).send(response)
            } catch (error) {
                console.log("Could not connect to server. Server gone fishing.", error)
                res.status(500).send("Could not connect to server.")
            }
        }
    })
})
//Route for StreamWaterPollutionData
router.post('/streamWaterPollutionData', (req, res) => {
  const { location, pollutionLevel } = req.body;
    //Bidirectional Streaming RPC StreamAirPollutionData
    const call = clientWater.streamWaterPollutionData();
    call.on('data', (response) => {
        console.log(`${response.location} recorded a pollution level of ${response.pollution_level}. ${response.message}`);
    });
    call.on('end', () => {
        console.log("Server Connection Ended");
        res.status(200).send("Server Connection Ended");
    });
    call.on('error', (error) => {
        console.error("An Error Occurred", error);
        res.status(500).send("An Error Occurred");
    });
    //Get user input for location and pollution level
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Where is this survey for? ", (location) => {
        rl.question("What is the pollution level? (Type q to quit)", (pollution_level) => {
            if (pollution_level.toLowerCase() === "q") {
                call.end();
                rl.close();
            } else {
                call.write({
                    location: location,
                    pollution_level: parseFloat(pollution_level)
                });
            }
        });
    });
})
//Route for GetHistoricalWaterPollutionData
router.post('/getHistoricalWaterPollutionData', (req, res) => {
  const {location, days} = req.body
  //Server Streaming RPC GetHistoricalWaterPollutionData
    const call = clientWater.GetHistoricalWaterPollutionData({location, days})
    call.on('data', (response) => {
        console.log("Record Data:  " + response.water_data)
        res.status(200).send(response.water_data)
    });
    call.on('end', () => {
        console.log("Server Connection Ended")
        res.status(200).send("Server Connection Ended")
    });
    call.on('error', (error) => {
        console.log("An Error Occurred. Mercury is in retrograde.", error)
        res.status(500).send("An error occurred while getting historical air pollution data.")
    })
})
//Route for ConfigureWaterSensorSettings
router.post('/configureWaterSensorSettings', (req, res) => {
  const { location } = req.body
    //Unary RPC ConfigureWaterSensorSettings
    clientWater.ConfigureWaterSensorSettings({ location }, (error, response) => {
        if (error) {
            console.error("Error: ", error)
            res.status(500).send("An error occurred while configuring water sensor settings.")
        } else {
            try {
                if (response.message) {
                    console.log(response.message)
                    res.status(200).send(response.message)
                } else {
                    console.log("Result: ", response.result, "Last Inspection Date: ", response.last_inspection)
                    res.status(200).send(response)
                }
            } catch (error) {
                console.log("Could not connect to server. Left keys at home.", error)
                res.status(500).send("Could not connect to server.")
            }
        }
    })
})
//Route for PublishWeatherData
router.post('/publishWeatherData', (req, res) => {
  const { temperature, humidity } = req.body
    //Client Streaming RPC PublishWeatherData
    const call = clientWeather.PublishWeatherData((error, response) => {
        if (error) {
            console.error("An error occurred", error)
            res.status(500).send("An error occurred.")
        } else {
            console.log("From the input data, the average temperature is " + response.average_temperature + " and the average humidity is " + response.average_humidity)
            res.status(200).send(response)
        }
    });
    const weatherData = { temperature: parseFloat(temperature), humidity: parseFloat(humidity) }
    call.write(weatherData);
    call.end();
})
//Route for GetHistoricalWeatherData
router.post('/getHistoricalWeatherData', (req, res) => {
  const {location, days} = req.body
  //Server Streaming RPC GetHistoricalWaterPollutionData
    const call = clientWeather.GetHistoricalWeatherData({location, days})
    call.on('data', (response) => {
        console.log("Record Data:  " + response.weather_data)
        res.status(200).send(response.weather_data)
    });
    call.on('end', () => {
        console.log("Server Connection Ended")
        res.status(200).send("Server Connection Ended")
    });
    call.on('error', (error) => {
        console.log("An Error Occurred. Mercury is in retrograde.", error)
        res.status(500).send("An error occurred while getting historical air pollution data.")
    })
})
//Route for ConfigureStationSettings
router.post('/configureStationSettings', (req, res) => {
  const { location } = req.body;
    //Unary RPC ConfigureStationSettings
    clientWeather.ConfigureStationSettings({ location }, (error, response) => {
        if (error) {
            console.error("Error: ", error);
            res.status(500).send("An error occurred while configuring weather station settings.")
        } else {
            try {
                if (response.message) {
                    console.log(response.message);
                    res.status(200).send(response.message)
                } else {
                    console.log("Result: " + response.result + " Last Inspection Date: " + response.last_inspection)
                    res.status(200).send(response)
                }
            } catch (error) {
                console.log("Could not connect to server. Must be this tall to enter.", error)
                res.status(500).send("Could not connect to server.")
            }
        }
    });
})

module.exports = router;
