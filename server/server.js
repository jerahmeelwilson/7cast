require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { SERVER_PORT } = process.env;

const { cityOneCall } = require("./controller.js");
const { seed, getCities, addCity, deleteCity } = require("./db");

app.use(express.json());
app.use(cors());

app.post("/seed", seed);

app.get("/api/Cities", getCities);
app.post("/api/addCity", addCity);
app.delete("/api/deleteCity/:id", deleteCity);

app.get("/api/City/onecall/:latitude/:longitude", cityOneCall);

app.listen(SERVER_PORT, () => console.log(`up on ${SERVER_PORT}`));
