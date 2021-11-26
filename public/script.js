console.log("test");


var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  var crd = pos.coords;
  axios.get(`http://localhost:4004/api/currentCity/${crd.latitude}/${crd.longitude}`)
    .then((weatherData) => {
      console.log(weatherData.data);
      buildPage(weatherData.data)
  })
  axios.get(`http://localhost:4004/api/currentCity/onecall/${crd.latitude}/${crd.longitude}`)
    .then((onecallData) => {
      console.log(onecallData.data);
  })
    .catch((err) => console.log(err));
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

const cityName = document.getElementById('cityName');
function buildPage(cityData) {
  cityName.textContent = cityData.name;
}