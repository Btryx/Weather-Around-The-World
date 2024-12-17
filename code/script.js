const searchbar = document.querySelector(".searchInput");
const searchButton = document.querySelector('.searchButton');
const toggleButton = document.querySelector(".unit");
const toggleTimeButton = document.querySelector(".timeFrame");
const weatherContainer = document.querySelector('.weather');
const errorMsg = document.querySelector('.error_msg');
const clock = document.querySelector('.clock');
const loader = document.querySelector('.loader-div');

let unit = "metric";
let isMetric = true;
let isClockTwelve = true;

// Initialization
window.onload = () => {
	setTimeout(() => {
        loader.style.display = 'none';
    }, 1000);
	setInterval(updateTime, 1000);
	weather.fetchWeather("Budapest");
};

//api
let city = "";
let currentTimezoneOffset = 0;

let weather = {
    "apiKey": apiKey,
    fetchWeather: function(cityName) {
        city = cityName;
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=" + unit + "&appid=" + this.apiKey)
        .then((response) => {
            if (!response.ok) {
              console.log("No city found at that name.")
              weatherContainer.style.visibility = "hidden";
              errorMsg.style.visibility = "visible";
              throw new Error(response.status);
            }
            errorMsg.style.visibility = "hidden";
            weatherContainer.style.visibility = "visible";
            return response.json();
          })
          .then((data) => this.displayWeather(data))
    },
    displayWeather: function(data) {
        const {name} = data;
        const {icon, description} = data.weather[0];
        const {temp, humidity, feels_like} = data.main;
        const {speed} = data.wind;
        const {timezone} = data;
        currentTimezoneOffset = timezone;
        console.log(name, icon, description, temp, humidity, speed, feels_like, timezone)
        document.querySelector("#city").innerText = name;
        if(isMetric){
            document.querySelector("#temp").innerText = temp.toFixed(1) + " °C";
            document.querySelector("#feels-like").innerText = "Feels like: " + feels_like.toFixed(1) + " °C";
            document.querySelector("#wind-speed").innerText = "Wind speed: " + speed + " m/s";
        }else{
            document.querySelector("#temp").innerText = temp.toFixed(1) + " °F";
            document.querySelector("#feels-like").innerText = "Feels like: " + feels_like.toFixed(1) + " °F";
            document.querySelector("#wind-speed").innerText = "Wind speed: " + speed + " MPH";
        }
        document.querySelector("#humidity").innerText = "Humidity: " + humidity+ "%";
        document.querySelector("#icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
        document.querySelector("#description").innerText = description.toUpperCase();
    },
    searching: function() {
        this.fetchWeather(searchbar.value);
    },

    search_reload: function() {
        this.fetchWeather(city);
    },

};

//dealing with time
const updateTime = setInterval(() => {
    let date = new Date();
    let utcHours = date.getUTCHours();
    let utcMinutes = date.getUTCMinutes();
    let utcSeconds = date.getUTCSeconds();
    const localOffsetHours = Math.floor(currentTimezoneOffset / 3600);
    const localOffsetMinutes = (currentTimezoneOffset % 3600) / 60;


    let hours = utcHours + localOffsetHours;
    let minutes = utcMinutes + localOffsetMinutes;
    let amPm = 'AM'; //am = before midday

    if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
    } else if (minutes < 0) {
        minutes += 60;
        hours -= 1;
    }

    if (hours >= 24) hours -= 24;
    if (hours >= 12) {
        amPm = 'PM';
        if (isClockTwelve) {
            if (hours > 12) hours -= 12;
        }
    }

    clock.innerText = formatTime(hours, minutes, utcSeconds, amPm);
});

const formatTime = (hours, minutes, seconds, amPm) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${hours}:${pad(minutes)}:${pad(seconds)} ${amPm}`;
};

//searching
searchButton.addEventListener("click", function () {
    if(searchbar.value){
        weather.searching();
        searchbar.value = '';
    }
});

searchbar.addEventListener("keyup", function (event){
    if (event.key == "Enter"){
        if (searchbar.value){
            console.log(event);
            weather.searching();
            searchbar.value = "";
        }
    }
});


toggleButton.addEventListener("click", () => {
    isMetric = !isMetric;
    unit = isMetric ? 'metric' : 'imperial';
    weather.search_reload();
});

toggleTimeButton.addEventListener("click", () => {
    isClockTwelve = !isClockTwelve;
    updateTime
});