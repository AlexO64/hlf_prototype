"use strict";

const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const { invoke_contract } = require("./invoke_contract.js");

// Create an express instance
const app = express();

// For any non-static content requests, parse the body for json content
app.use(bodyParser.json({limit: "1mb"}));

// Add request handler routes
app.get("/api/*", async(request, response) => {
    const method = request.params["0"];
    const params = request.url.split("?")[1].split("&");
    const result = await invoke_contract(method, params);
    response.setHeader("Content-Type", "application/json");
    response.send(result);
});

// If nothing else handles the request, serve 404 error
app.use((request, response) => {
    response.status(404);
    response.setHeader("Content-Type", "application/json");
    response.send(JSON.stringify({
        error: "not found"
    }));
});

// Create the server instance as either http or https depending on configuration
let server = http.createServer(app);
let listenPort = 8080;

// Start the server
server.listen(listenPort, () => {
    console.log("Started server on port " + listenPort);
});
