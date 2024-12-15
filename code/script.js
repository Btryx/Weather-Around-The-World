const searchbar = document.querySelector(".searchInput");
const searchButton = document.querySelector('.searchButton');
const toggleButton = document.querySelector(".unit");
const weatherContainer = document.querySelector('.weather');
const errorMsg = document.querySelector('.error_msg');
const clock = document.querySelector('.clock');
const loader = document.querySelector('.loader-div');

// Initialization
window.onload = () => {
    loader.style.display = 'none';
    weather.fetchWeather("Budapest");
    setInterval(timeInt, 1000);
};

//dealing with metric and imperial system
let unit = "metric";
let isMetric = true;

toggleButton.addEventListener("click", () => {
    isMetric = !isMetric;
    unit = isMetric ? 'metric' : 'imperial';
    weather.search_reload();
})


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
let AM_PM = "AM"; //am = before midday
const timeInt = setInterval(() => {
    let date = new Date();
    let utc_hour = date.getUTCHours();
    let utc_minutes = date.getUTCMinutes();
    let utc_seconds = date.getUTCSeconds();
    let hour = 0;
    let diff_in_hours = parseInt(currentTimezoneOffset/3600);
    if(currentTimezoneOffset % 3600 == 0){

        hour = utc_hour + (diff_in_hours);
        if(hour >= 24){
            AM_PM = "AM";
            hour -= 24;
        }
        else if(hour >= 12){
            AM_PM = "PM";
            hour -= 12;
            if(hour == 0){
                hour = 12;
            }
        else if(hour < 0){
            hour = abs(hour);
            AM_PM = "PM";
        }
        }else{
            AM_PM = "AM";
        }

        if(hour == 12){
            AM_PM = "PM";
        }

        if(hour < 0){
            hour += 12;
        }
    }else{
        hour = utc_hour + (diff_in_hours); 
        if( currentTimezoneOffset > 0){
            m_minute = (currentTimezoneOffset % 3600)/60;
            hour = utc_hour + (diff_in_hours); 
            utc_minutes += m_minute;

            if(utc_minutes >= 60){
                utc_minutes -= 60;
                hour += 1;
            }

            if(hour >= 24){
                AM_PM = "AM";
                hour -= 24;
            }
            else if(hour >= 12){
                AM_PM = "PM";
                hour -= 12;
                if(hour == 0){
                    hour = 12;
                }
            }else{
                AM_PM = "AM";
            }

            if(hour == 12){
                AM_PM = "PM";
            }
            if(hour < 0){
                hour += 12;
            }

        //if diff is negative
        }else{
            AM_PM = "AM";
            m_minute = (currentTimezoneOffset % 3600)/60;
            utc_minutes -= m_minute;

            if(utc_minutes < 0){
                utc_minutes += 60;
                hour -= 1;
            }

            if(hour >= 12){
                AM_PM = "PM";
                hour -= 12;
                if(hour == 0){
                    hour = 12;
                }
            }else if(hour < 0){
                hour = abs(hour);
                AM_PM = "PM";
            }
            else{
                AM_PM = "AM";
            }

            if(hour == 12){
                AM_PM = "PM";
            }

            if(hour < 0){
                hour += 12;
            }
        }
    }

    if(utc_minutes < 10 && utc_seconds < 10 ){
        clock.innerHTML = hour + ":0" + utc_minutes + ":0" + utc_seconds + " " + AM_PM;
    }
    else if(utc_seconds < 10){
        clock.innerHTML = hour + ":" + utc_minutes + ":0" + utc_seconds + " " + AM_PM;
    }
    else if(utc_minutes < 10){
        clock.innerHTML = hour + ":0" + utc_minutes + ":" + utc_seconds + " " + AM_PM;
    }else{
        clock.innerHTML = hour + ":" + utc_minutes + ":" + utc_seconds + " " + AM_PM;    
    }
    }, 0
);

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