var readlineSync = require("readline-sync")
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

var client = new pollution_proto.PollutionService("0.0.0.0:40000", grpc.credentials.createInsecure())
