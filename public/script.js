console.log("test");
const citySearch = document.querySelector("[data-city-search]");
const searchBox = new google.maps.places.SearchBox(citySearch);
const cityCards = document.getElementById("cityCards");

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
  axios.get(`http://localhost:4004/api/Cities/`).then((res) => {
    res.data.forEach((city) => {
      axios
        .get(
          `http://localhost:4004/api/City/onecall/${city.latitude}/${city.longitude}`
        )
        .then((onecallData) => {
          //console.log(onecallData.data);
          let currentWeather = onecallData.data.current.weather[0].main;
          let temp_min = Math.round(onecallData.data.daily[0].temp.min);
          let current_temp = Math.round(onecallData.data.current.temp);
          let temp_max = Math.round(onecallData.data.daily[0].temp.max);
          let place_id = city.place_id;
          let cityCard = `
          <div class='city-card'>
            <img class = 'card-img' src = ${city.photo} width ="250" height = "250">
            <div class = 'card-title'>
              <h5> ${city.name}</h5> <span>${currentWeather}</span>
            </div>
            <div class = 'card-temp'>
              <p>Low: ${temp_min}°</p><p class='main-temp'>${current_temp}°</p><p>High: ${temp_max}°</p>
            </div>
            <div class = 'card-bottom'>
              <button class="delbtn" id ="${place_id}">X</button>
            </div>
          </div>
          <br />    
        `;
          cityCards.innerHTML += cityCard;
          let delbtns = document.querySelectorAll(".delbtn");
          delbtns.forEach((btn) => {
            btn.addEventListener("click", deleteCity);
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

getCities();
