"use strict";

const express = require("express");
const mongoose = require("mongoose");
const cacheMiddleware = require("./middlewares/cacheMiddleware.js");
const hospitalController = require("./controllers/hospitalController.js");
const fabricNetwork = require("./network/fabricNetwork.js");
const config = require("./config");

const app = express();
const port = 3002;

app.use(express.json());

// Async function to start server and connect to DB
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB Connected");

    //Initialize Fabric Network Gateways
    await fabricNetwork.initializeGateways(config.userIds);

    // Dynamic route setup
    const routes = [
      { path: "/getHospitalRole10", cacheTime: 10, controllerMethod: "getHospitalRole10" },
      { path: "/getHospitalRole20", cacheTime: 5, controllerMethod: "getHospitalRole20" },
      { path: "/getHospitalRole30", cacheTime: 5, controllerMethod: "getHospitalRole30" },
      { path: "/getHospitalRole40", cacheTime: 5, controllerMethod: "getHospitalRole40" },
      { path: "/getHospitalRole50", cacheTime: 5, controllerMethod: "getHospitalRole50" },
    ];

    // Register routes
    routes.forEach(({ path, cacheTime, controllerMethod }) => {
      app.get(path, cacheMiddleware(cacheTime), hospitalController[controllerMethod]);
    });

    app.post("/uploadEHR", hospitalController.uploadEHR);

    app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
  } catch (error) {
    console.error(`Failed to start the server or connect to MongoDB: ${error}`);
  }
}

startServer();
