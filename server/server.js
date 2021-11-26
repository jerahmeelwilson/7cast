require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { SERVER_PORT } = process.env;

const { currentCity, currentCityOneCall } = require("./controller.js");

app.use(express.json());
app.use(cors());

app.get("/api/currentCity/:latitude/:longitude",currentCity)
app.get("/api/currentCity/onecall/:latitude/:longitude",currentCityOneCall)

app.listen(SERVER_PORT, () => console.log(`up on ${SERVER_PORT}`));
