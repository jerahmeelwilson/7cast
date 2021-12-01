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
          let current_sunrise = onecallData.data.current.sunrise;
          let current_sunset = onecallData.data.current.sunset;
          let timezone = onecallData.data.timezone;
          let cityCard = `
          <div class='city-card'>
            <img class = 'card-img' src = ${
              city.photo
            } width ="350" height = "350">
            <div class = 'card-title'>
              <h5> ${
                city.name
              }</h5> <div class ="card_current_weather"><span class="card_weather_main">${currentWeather}</span> ${getIcon(
            onecallData.data.current.weather[0].icon
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
          daily.shift();
          let dailyHTML = "";
          daily.forEach((day) => {
            dailyHTML += `<div class = "daily_forecast">
              <h5>${dtConvertLocaleDate(day.dt, timezone).substring(
                0,
                10
              )}</h5> 
              <div class = 'daily_weather'>
                <p>${day.weather[0].description}</p>
                ${getIcon(day.weather[0].icon)}
              </div>
              <div class ="daily_temp">
                    <p class="daily_low_temp">${Math.round(day.temp.min)}</p>
                    <br />
                    <p class="daily_high_temp">${Math.round(day.temp.max)}</p>                 
              </div>
            </div>`;
          });
          let modal = `
           <div class = "modal ${place_id}">
            <div class="modal_heading"> <h5>${
              city.name
            }</h5> <h5>${dtConvertLocaleDate(current_dt, timezone)}</h5></div>
          <div class ="current_weather_table">
            <table>
              <tr>
                <th>Description:</th>
                <td>${currentWeatherDesc}</td>
              </tr> 
              <tr>
                <th>Wind Speed:</th>
                <td>${onecallData.data.current.wind_speed} mph</td>
              </tr>
              <tr>
                <th>Sunrise:</th>
                <td>${dtConvertLocaleTime(current_sunrise, timezone)}</td>
              </tr>
              <tr>
                <th>Sunset:</th>
                <td>${dtConvertLocaleTime(current_sunset, timezone)}</td>
              </tr>
              <tr>
                <th>Humidity</th>
                <td>${onecallData.data.current.humidity}%</td>
              </tr>
              <tr>
                <th>Cloudiness:</th>
                <td>${onecallData.data.current.clouds}%</td>
              </tr>
              <tr>
                <th>UVI:</th>
                <td>${onecallData.data.current.uvi}</td>
              </tr>
            </table>
          </div>
          <div class = "hourly_forecast_box">
          ${hourlyforcast(onecallData.data.hourly, timezone)}
          </div>
          <div class = "daily_container">
          ${dailyHTML}
          <div>
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

function dtConvertLocaleDate(dt, timezone) {
  let options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  options.timeZone = timezone;
  options.timeZoneName = 'short'
  let date = new Date(dt * 1000);
  return (
    date.toLocaleDateString("en-US", options) +
    " " +
    dtConvertLocaleTime(dt, timezone)
  );
}

function dtConvertLocaleTime(dt, timezone) {
  let options = { timeStyle: "short" };
  options.timeZone = timezone;
  let date = new Date(dt * 1000);
  return date.toLocaleTimeString("en-US", options);
}

function dtConvertLocateTimeHour(dt, timezone) {
  let date = new Date(dt * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    timeZone: timezone,
  });
}

function hourlyforcast(hours, timezone) {
  let hourlyForcast = ``;
  hours.forEach((hour) => {
    hourlyForcast += `
    <div class ="hourly_div">
    <h5>${dtConvertLocateTimeHour(hour.dt, timezone)}</h5>
    ${getIcon(hour.weather[0].icon)}
    <p>${Math.round(hour.temp)}°</p>
    </div>  
    `;
  });
  return hourlyForcast;
}

const weatherIcons = {
  clear_sky_day: `<img src="images/amcharts_weather_icons_1.0.0/animated/day.svg" alt="">`,
  clear_sky_night: `<img src="images/amcharts_weather_icons_1.0.0/animated/night.svg" alt="">`,
  cloudy_day: `<img src="images/amcharts_weather_icons_1.0.0/animated/cloudy-day-3.svg" alt="">`,
  cloudy_night: `<img src="images/amcharts_weather_icons_1.0.0/animated/cloudy-night-3.svg" alt="">`,
  cloudy: `<img src="images/amcharts_weather_icons_1.0.0/animated/cloudy.svg" alt="">`,
  drizzle: `<img src="images/amcharts_weather_icons_1.0.0/animated/rainy-1.svg" alt="">`,
  rain: `<img src="images/amcharts_weather_icons_1.0.0/animated/rainy-6.svg" alt="">`,
  snow: `<img src="images/amcharts_weather_icons_1.0.0/animated/snowy-5.svg" alt="">`,
  thunder: `<img src="images/amcharts_weather_icons_1.0.0/animated/thunder.svg" alt="">`,
};

function getIcon(iconId) {
  if (iconId == "01d") {
    return weatherIcons.clear_sky_day;
  } else if (iconId == "01n") {
    return weatherIcons.clear_sky_night;
  } else if (iconId == "02d") {
    return weatherIcons.cloudy_day;
  } else if (iconId == "02n") {
    return weatherIcons.cloudy_night;
  } else if (iconId == "09d") {
    return weatherIcons.drizzle;
  } else if (iconId == "10d") {
    return weatherIcons.rain;
  } else if (iconId == "11d") {
    return weatherIcons.thunder;
  } else if (iconId == "13d") {
    return weatherIcons.snow;
  } else {
    return weatherIcons.cloudy;
  }
}

getCities();
