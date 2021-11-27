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
          <img src =${city.photo} width ="250" height = "250">
          <p>${city.name}</p> <span>${currentWeather}</span>
          <p>Low: ${temp_min}°</p>${current_temp}°</p><p>${temp_max}°</p>
          <button class="delbtn" id ="${place_id}">X</button>
        </div>     
        `;
          cityCards.innerHTML += cityCard;
        });
    });
  });
}

function deleteCity() {
  e.preventDefault();
  console.log("hello");
  //   // axios
  //   //   .delete(`http://localhost:4004/deleteCity/${place_id}`)
  //   //   .then(() => getCities())
  //   //   .catch((err) => console.log(err));
}

getCities();
