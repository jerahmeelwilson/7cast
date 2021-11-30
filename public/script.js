console.log("test");
const citySearch = document.querySelector("[data-city-search]");
const searchBox = new google.maps.places.SearchBox(citySearch);
const cityCards = document.getElementById("cityCards");
const modal_bg = document.querySelector(".modal-bg");

class City {
  constructor(place_id, name, latitude, longitude, photo) {
    this.place_id = place_id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
    this.photo = photo;
  }
}

searchBox.addListener("places_changed", () => {
  const place = searchBox.getPlaces()[0];
  if (place == null) return;
  let latitude = place.geometry.location.lat();
  let longitude = place.geometry.location.lng();
  let photo = place.photos[0].getUrl();
  let name = place.formatted_address;
  let place_id = place.place_id;
  let newCity = new City(place_id, name, latitude, longitude, photo);
  axios
    .post("http://localhost:4004/api/addCity", newCity)
    .then(() => {
      getCities();
      citySearch.value = "";
    })
    .catch((err) => {
      console.log(err);
      getCities();
    });
});

function getCities() {
  cityCards.innerHTML = "";
  let modals = [];
  axios.get(`http://localhost:4004/api/Cities/`).then((res) => {
    res.data.forEach((city) => {
      axios
        .get(
          `http://localhost:4004/api/City/onecall/${city.latitude}/${city.longitude}`
        )
        .then((onecallData) => {
          console.log(onecallData.data);
          let currentWeather = onecallData.data.current.weather[0].main;
          let currentWeatherDesc =
            onecallData.data.current.weather[0].description;
          let temp_min = Math.round(onecallData.data.daily[0].temp.min);
          let current_temp = Math.round(onecallData.data.current.temp);
          let temp_max = Math.round(onecallData.data.daily[0].temp.max);
          let place_id = city.place_id;
          let current_dt = onecallData.data.current.dt;
          let current_sunset = onecallData.data.current.sunset;
          let cityCard = `
          <div class='city-card'>
            <img class = 'card-img' src = ${
              city.photo
            } width ="325" height = "325">
            <div class = 'card-title'>
              <h5> ${
                city.name
              }</h5> <div class ="card_current_weather"><span>${currentWeather}</span> ${getIcon(
            currentWeather,
            current_dt,
            current_sunset,
            currentWeather
          )}</div>
            </div>
            <div class = 'card-temp'>
              <p class ='card_low_temp'>Low: ${temp_min}°</p><p class='card_main-temp'>${current_temp}°</p><p class ="card_high_temp">High: ${temp_max}°</p>
            </div>
            <div class = 'card-bottom'>
              <button class="seemore ${place_id}">See more</button>
              <button class="delbtn" id ="${place_id}">X</button>
            </div>
          </div>
          <br />    
        `;
          let daily = onecallData.data.daily;
          let dailyHTML = "";
          daily.forEach((day) => {
            dailyHTML += `<div>
              <h5>${dtConvert(day.dt)}</h5> <p>${day.weather[0].description}</p>
            </div>`;
          });
          let modal = `
           <div class = "modal ${place_id}">
            <h5>${city.name}</h5>
            ${dailyHTML}
            <span class = "modal-close">X</span>
           </div>
        `;
          modals.push(modal);
          cityCards.innerHTML += cityCard;
          let delbtns = document.querySelectorAll(".delbtn");
          delbtns.forEach((btn) => {
            btn.addEventListener("click", deleteCity);
          });
          let seemoreBtns = document.querySelectorAll(".seemore");
          seemoreBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              modal_bg.innerHTML = "";
              modals.forEach((modal) => {
                if (modal.includes(e.target.classList[1])) {
                  modal_bg.innerHTML = modal;
                  modal_bg.classList.add("bg-active");
                  let modalClose = document.querySelector(".modal-close");
                  modalClose.addEventListener("click", () => {
                    modal_bg.classList.remove("bg-active");
                  });
                }
              });
            });
          });
        });
    });
  });
}

function deleteCity(e) {
  e.preventDefault();
  axios
    .delete(`http://localhost:4004/api/deleteCity/${e.target.id}`)
    .then(() => getCities())
    .catch((err) => console.log(err));
}

function dtConvert(dt) {
  let date = new Date(dt * 1000);
  return `${date.getMonth(date) + 1}/${date.getDate(date) + 1} `;
}

const weatherIcons = {
  clear_sky_day: `<img src="images/amcharts_weather_icons_1.0.0/animated/day.svg" alt="">`,
  clear_sky_night: `<img src="images/amcharts_weather_icons_1.0.0/animated/night.svg" alt="">`,
  cloudy_day: `<img src="images/amcharts_weather_icons_1.0.0/animated/cloudy_day.svg" alt="">`,
  cloudy_night: `<img src="images/amcharts_weather_icons_1.0.0/animated/cloudy_day.svg" alt="">`,
  cloudy: `<img src="images/amcharts_weather_icons_1.0.0/animated/cloudy.svg" alt="">`,
  drizzle: `<img src="images/amcharts_weather_icons_1.0.0/animated/rainy-1.svg" alt="">`,
  rain: `<img src="images/amcharts_weather_icons_1.0.0/animated/rainy-6.svg" alt="">`,
  snow: `<img src="images/amcharts_weather_icons_1.0.0/animated/snowy-5.svg" alt="">`,
  thunder: `<img src="images/amcharts_weather_icons_1.0.0/animated/thunder.svg" alt="">`,
};

function getIcon(weather, current_time, sunset, description) {
  if (weather == "Clear" && current_time < sunset) {
    return weatherIcons.clear_sky_day;
  } else if (weather == "Clear" && current_time > sunset) {
    return weatherIcons.clear_sky_night;
  } else if (
    weather == "Clouds" &&
    description == "few clouds" &&
    current_time < sunset
  ) {
    return weatherIcons.cloudy_day;
  } else if (
    weather == "Clouds" &&
    description == "few clouds" &&
    current_time > sunset
  ) {
    return weatherIcons.cloudy_night;
  } else if (weather == "Drizzle") {
    return weatherIcons.drizzle;
  } else if (weather == "Rain") {
    return weatherIcons.rain;
  } else if (weather == "Thunderstorm") {
    return weatherIcons.thunder;
  } else if (weather == "Snow") {
    return weatherIcons.snow;
  } else {
    return weatherIcons.cloudy;
  }
}

getCities();
