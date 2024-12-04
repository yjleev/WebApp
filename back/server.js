const express = require("express");
const webSocket = require("./clientSocket.js");
const bodyParser = require("body-parser");

const app = express();
const port = 5215;

app.use(bodyParser.json());

const server = app.listen(port, () => {
  console.log(`server is running... http://localhost:${port}`);
});

webSocket(server);