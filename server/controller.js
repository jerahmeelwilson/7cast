const { default: axios } = require("axios");

require("dotenv").config();
const { MY_API_KEY } = process.env;

module.exports = {
  currentCity: (req, res) => {
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${req.params.latitude}&lon=${req.params.longitude}&appid=${MY_API_KEY}&units=imperial`)
    .then(weatherRes => {
        res.status(200).send(weatherRes.data)
    })
    .catch(err => {
       console.log(err)
    })
  },
  currentCityOneCall: (req, res) => {
    axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${req.params.latitude}&lon=${req.params.longitude}&appid=${MY_API_KEY}&units=imperial`)
    .then(weatherRes => {
        res.status(200).send(weatherRes.data)
    })
    .catch(err => {
       console.log(err)
    })
  }
};
