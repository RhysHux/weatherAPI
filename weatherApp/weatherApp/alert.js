// dictionary for the UV index and what precautions to take at each level
var uvIndexDic = {
  0: "The UV Index measures 0 today, Apply SPF 15.",
  1: "The UV Index measures 1 today, Apply SPF 15.",
  2: "The UV Index measures 2 today, Apply SPF 15.",
  3: "The UV Index measures 3 today, Apply SPF 15+ and wear protective clothing/hat.",
  4: "The UV Index measures 4 today, Apply SPF 15+ and wear protective clothing/hat.",
  5: "The UV Index measures 5 today, Apply SPF 30+, wear protective clothing/hat and sunglasses.",
  6: "The UV Index measures 6 today, Apply SPF 30+, wear protective clothing/hat and sunglasses.",
  7: "The UV Index measures 7 today, Apply SPF 50, wear protective clothing/hat, wear sunglasses and SEEK SHADE.",
  8: "The UV Index measures 8 today, Apply SPF 50, wear protective clothing/hat, wear sunglasses and SEEK SHADE.",
  9: "The UV Index measures 9 today, Apply SPF 50, wear protective clothing/hat, wear sunglasses and SEEK SHADE.",
  10: "The UV Index measures 10 today, Apply SPF 50+, wear protective clothing/hat, wear sunglasses and AVOID SUN 10AM - 4PM.",
  11: "WARNING EXTREME WEATHER<br> The UV Index measures 11 today, Apply SPF 50+, wear protective clothing/hat, wear sunglasses and AVOID SUN 10AM - 4PM.",
};

// dictionary for the pollen and what precautions to take at each level
var pollenDic = {
  0: "Pollen count is Low today, wear sunglasses and take a shower.",
  1: "Pollen count is high today, wear sunglasses and a pollen mask. Stay inside 10AM - 4PM. Keep windows and doors close.",
  2: "Pollen count is extreme today, stay inside, keep windows and doors closed, use a air purifier, take specialized allergy medication.",
};

// dictionary for the humidity and what precautions to take at each level
var humidityDic = {
  0: "Humidity is Low today, stay hydrated, use moisturizer, use a humidifier, avoid spending too long outside during the dryest parts of the day.",
  1: "Humidity is moderate today, comfortable for most people. Stay hydrated and use moisturizer if needed.",
  2: "Humidity is high today, stay in shady and air-conditioned places, use a dehumidifier, use a air purifier if needed and take a shower to cool off.",
};

// settting variable for chart
var forecastTempChart;

// function to show the search bar for the location of the alerts
function alertsOn() {
  document.getElementById("search").innerHTML +=
    "<div id='input'> <input id='searchVal' type='search' placeholder='City search...' /> <button type='submit' onclick='alertOnLocation()' id='submit'>Submit</button></div>";
}
// function to turn off the alerts
function alertsOff() {
  var alerts = document.getElementById("alerts");
  var search = document.getElementById("search");
  var invalidLoc = document.getElementById("invalidLoc");
  alerts.parentNode.removeChild(alerts);
  search.parentNode.removeChild(search);
  invalidLoc.parentNode.removeChild(invalidLoc);
  document.getElementById("uvWarning").innerHTML = "Alerts turned off!";
  document.getElementById("pollenWarning").innerHTML = "Alerts turned off!";
  document.getElementById("humidityWarning").innerHTML = "Alerts turned off!";
}

// api key for open weather
const apiKey = "f11f310664bef153e061d0df7ecce96b";
// function
function alertOnLocation() {
  if ("searchVal" == "") {
    console.log("No location");
    document.getElementById("invalidLoc").innerHTML = "Invalid Location";
  } else {
    var location = document.getElementById("searchVal").value;
    // getting the value of the input
    // URL to get weather data for location
    const urlLocation = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    fetch(urlLocation)
      .then((response) => response.json())
      .then((data) => {
        console.log("DATA FROM openweathermap---", data);
        // destrcturing data object to get the relevant data
        const { main, name, sys, weather, coord } = data;
        // console.log("coord", coord);
        var lat = coord.lat;
        var lon = coord.lon;
        let temp = main.temp;
        let desc = weather[0].description;
        icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

        document.getElementById("cityName").innerHTML = location;
        document.getElementById("temp").innerHTML = temp + "℃";
        document.getElementById("weatherIcon").src = icon;
        document.getElementById("weatherDesc").innerHTML = desc;

        warningData = true;
        // URL to get weather data for location
        if (warningData) {
          const urlAir = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=uv_index,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`;
          fetch(urlAir)
            .then((response) => response.json())
            .then((data) => {
              console.log("DATA AIR----", data);
              // destrcturing data object to get the relevant data

              var uvIndexs = data.hourly.uv_index;
              var currentHrIndex = new Date().getHours();
              var pollenIndex =
                data.hourly.alder_pollen[currentHrIndex] +
                data.hourly.birch_pollen[currentHrIndex] +
                data.hourly.grass_pollen[currentHrIndex] +
                data.hourly.mugwort_pollen[currentHrIndex] +
                data.hourly.olive_pollen[currentHrIndex] +
                data.hourly.ragweed_pollen[currentHrIndex];
              console.log("pollen", pollenIndex);
              var currentUvIndex = uvIndexs[currentHrIndex];
              // var currentPollenIndex = pollenIndex[currentHrIndex];
              // console.log("current", currentPollenIndex);

              console.log("indexData", {
                currentHrIndex,
                currentUvIndex,
                pollenIndex,
              });

              var uvIndex = Math.round(currentUvIndex);
              var pollenIndex = Math.round(pollenIndex);

              uvHealthMessage = uvIndexDic[uvIndex];
              if (pollenIndex <= 50) {
                pollenHealthMessage = pollenDic[0];
              } else if (pollenIndex > 50 && pollenIndex <= 150) {
                pollenHealthMessage = pollenDic[1];
              } else if (pollenIndex > 150) {
                pollenHealthMessage = pollenDic[2];
              }

              console.log("message", uvHealthMessage);
              console.log("message", pollenHealthMessage);

              document.getElementById("uvWarning").innerHTML = uvHealthMessage;
              document.getElementById("pollenWarning").innerHTML =
                pollenHealthMessage;

              getHumidity(lat, lon);
              getForecastTemp(lat, lon);
            })
            .catch((error) => {
              document.getElementById("uvWarning").innerHTML = "Data error.";
              document.getElementById("pollenWarning").innerHTML =
                "Data error.";
            });
        }
      });
  }
}

function getHumidity(lat, lon) {
  const urlHumidity = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=relativehumidity_2m`;
  fetch(urlHumidity)
    .then((response) => response.json())
    .then((data) => {
      console.log("humidity ----", data);

      var humidityIndexs = data.hourly.relativehumidity_2m;
      var currentHrIndex = new Date().getHours();
      var currentHumidityIndex = humidityIndexs[currentHrIndex];

      console.log("indexData", {
        currentHrIndex,
        currentHumidityIndex,
        humidityDic,
      });

      var humidityHealthMessage = "Invalid range";
      if (currentHumidityIndex <= 55) {
        humidityHealthMessage = humidityDic[0];
      } else if (currentHumidityIndex <= 65) {
        humidityHealthMessage = humidityDic[1];
      } else {
        humidityHealthMessage = humidityDic[2];
      }

      console.log("message", humidityHealthMessage);

      document.getElementById("humidityWarning").innerHTML =
        humidityHealthMessage;
    })
    .catch((error) => {
      document.getElementById("humidityWarning").innerHTML = "Data error.";
    });
}
// funtion for temperature forecast chart
function getForecastTemp(lat, lon) {
  // This code makes a request to the Open Meteo API for a weather forecast
  //  based on latitude and longitude coordinates
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,temperature_80m,temperature_120m,temperature_180m&forecast_days=1`
  )
    // if the reqiest is successful, the response is parsed as JSON
    .then((response) => response.json())
    // the data receive from the api is used to create
    // a new chart displaying temperature and dew point
    .then((data) => {
      let hourChartDisplay = [];
      for (let currentTime = 0; currentTime < data.hourly.time.length; currentTime++
      ) {
        hrArr = data.hourly.time;
        hourChartDisplay.push(hrArr[currentTime].split("T")[1]);
      }
      console.log("Data", data);
      // if a previous chart exists, it is cleared and destroyed
      if (forecastTempChart) {
        forecastTempChart.clear();
        forecastTempChart.destroy();
      }
      // the canvas element for the chart is obtained by its id and
      // its context is set to 2D
      const _ctx = document
        .getElementById("tempForecastChart")
        .getContext("2d");
      // a new chart object is created with the retreived data and
      // options for chart display

      forecastTempChart = new Chart(_ctx, {
        type: "bar",
        data: {
          labels: hourChartDisplay,
          datasets: [
            {
              label: "Temperature at 2m",
              data: data.hourly.temperature_2m,
              backgroundColor: "#C8331B",
              stack: "Stack 0",
              fontColor: [`white`],
            },
            {
              label: "Temperature at 80m",
              data: data.hourly.temperature_80m,
              backgroundColor: "#E56D31",
              stack: "Stack 1",
              fontColor: [`white`],
            },
            {
              label: "Temperature at 120m",
              data: data.hourly.temperature_120m,
              backgroundColor: "#F4CF47",
              stack: "Stack 2",
              fontColor: [`white`],
            },
            {
              label: "Temperature at 180m",
              data: data.hourly.temperature_180m,
              backgroundColor: "#68A828",
              stack: "Stack 3",
              fontColor: [`green`],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: 'white',
              },
              stacked: true,
            },
            y: {
              ticks: {
                color: 'white',
              },
              stacked: true,
            },
          },
          plugins: {
            title: {
              color: 'white',
              display: true,
              text: "24 Hour Temperature Forecast",
              padding: {
                top: 10,
                bottom: 30,
              },
            },
          },
        },
      });
    })
    // if an error occurs while fetching data from the api,
    // an error message is logged to their console
    .catch((error) => console.error(error));
}

// functions for cookies
function openForm() {
  document.getElementById("popupCookies").style.display = "block";
}
function closeForm() {
  document.getElementById("popupCookies").style.display = "none";
}

window.onclick = function (event) {
  let modal = document.getElementById("cookiesPopup");
  if (event.target == modal) {
    closeForm();
  }
};

function readMore() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");
  var btnText = document.getElementById("myBtn");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "inline";
  }
}
