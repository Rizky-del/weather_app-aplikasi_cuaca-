export const setPlaceholderText = () => {
    const input = document.getElementById('searchBar_form');
    window.innerWidth < 400 ? (input.placeholder = "City, State, Country") : (input.placeholder = "City, State, Country, or Zip Code");
}

export const addSpinner = (element) => {
    animateButton(element);
    setTimeout(animateButton, 1000, element);
};

const animateButton = (element) => {
    element.classList.toggle('none');
    element.nextElementSibling.classList.toggle('block');
    element.nextElementSibling.classList.toggle('none');
};

export const displayError = (headerMsg, srMsg) => {
    updateWeatherLocationHeader(headerMsg);
    updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
    const properMsg = toPropperCase(statusCode.message);
    updateWeatherLocationHeader(properMsg);
    updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
};  

const toPropperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
};

const updateWeatherLocationHeader = (message) => {
    const h1 = document.getElementById("currentForeceast_location");
    if (message.indexOf("lat:") !== -1 && message.indexOf("lon:") !== -1) {
        const msgArray = message.split(" ");
        const mapArray = msgArray.map((msg) => {
            return msg.replace(":", ": ");
        });
        const lat = 
            mapArray[0].indexOf("-") === -1 ? mapArray[0].slice(0, 10) : mapArray[0].slice(0, 11);
        const lon = 
            mapArray[1].indexOf("-") === -1 ? mapArray[1].slice(0, 11) : mapArray[0].slice(0, 12);
        h1.textContent = `${lat} • ${lon}`;
    } else {
        h1.textContent = message;
    }
};

export const updateScreenReaderConfirmation = (message) => {
    document.getElementById("confirmation").textContent = message;
}

export const updateDisplay = (weatherJson, locationObj) => {
    fadeDisplay();

    clearDisplay();
    const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
    setBGimage(weatherClass);

    const screenReaderWeather = buildScreenReaderWeather(
        weatherJson,
        locationObj
    );

    updateScreenReaderConfirmation(screenReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());
    // current conditions
    const ccArray = createCurrentConditionsDivs(weatherJson, locationObj.getUnit());
    displayCurrentConditions(ccArray);
    //six day foreceast
    displaySixDayForeceast(weatherJson);
    setFocustOnSearch();

    fadeDisplay();
};

const fadeDisplay = () => {
    const cc = document.getElementById("currentForeceast");
    cc.classList.toggle("zero-vis");
    cc.classList.toggle("fade-in");

    const sixDay = document.getElementById("dailyForeceast");
    sixDay.classList.toggle("zero-vis");
    sixDay.classList.toggle("fade-in");
};

const clearDisplay = () => {
    const currentCondition = document.getElementById("currentForeceast_conditions");
    deleteContents(currentCondition);

    const sixDayForeceast = document.getElementById("dailyForeceast_contents");
    deleteContents(sixDayForeceast);
};

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while(child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0, 2);
    const lastChars = icon.slice(2);
    const weatherLookup = {
        "09" : "snow",
        10 : "rain",
        11 : "rain",
        13 : "snow",
        50 : "fog"
    };
    let weatherClass;
    if (weatherLookup[firstTwoChars]) {
        weatherClass = weatherLookup[firstTwoChars];
    } else if (lastChars === "d") {
        weatherClass = "clouds";
    } else {
        weatherClass = "night";
    }
    return weatherClass;
};

const setBGimage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach((img) => {
        if (img !== weatherClass) document.documentElement.classList.remove(img);
    });
};

const buildScreenReaderWeather = (weatherJson, locationObj) => {
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial" ? "F" : "C";
    return `${weatherJson.current.weather[0].description} and ${Math.round(Number(weatherJson.current.temp))}°${tempUnit} in ${location}`; 
};

const setFocustOnSearch = () => {
    document.getElementById("searchBar_text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
    const tempUnit = unit == "imperial" ? "F" : "C";
    const windUnit = unit == "imperial" ? "mph" : "m/s";
    const icon = createMainImgDiv(
        weatherObj.current.weather[0].icon,
        weatherObj.current.weather[0].description
    );
    const temp = createElem(
        "div",
        "temp",
        `${Math.round(Number(weatherObj.current.temp))}°`,
        tempUnit
    );
    const properDesc = toPropperCase(weatherObj.current.weather[0].description);
    const desc = createElem("div", "desc", properDesc);
    const feels = createElem(
        "div",
        "feels",
        `Feels Like ${Math.round(Number(weatherObj.current.feels_like))}°`
    );
    const maxTemp = createElem(
        "div",
        "maxtemp",
        `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`
    );
    const minTemp = createElem(
        "div",
        "mintemp",
        `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`
    );
    const humidity = createElem(
        "div",
        "humidity",
        `Humidity ${Math.round(Number(weatherObj.current.humidity))}%`
    );
    const wind = createElem(
        "div",
        "wind",
        `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`
    );
    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText) => {
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconFontAwesome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit) => {
    const div = document.createElement(elemType);
    div.className = divClassName;
    if (divText) {
        div.textContent = divText;
    }
    if (divClassName === "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.classList.add("unit");
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }
    return div;
};

const translateIconFontAwesome = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0, 2);
    const lastChars = icon.slice(2);
    switch (firstTwoChars) {
        case "01":
            if (lastChars === "d") {
                i.classList.add("far", "fa-sun");
            } else {
                i.classList.add("far", "fa-moon");
            }
        break;
        case "02":
            if (lastChars === "d") {
                i.classList.add("fas", "fa-cloud-sun");
            } else {
                i.classList.add("fas", "fa-cloud-moon");
            }
        break;
        case "03":
            i.classList.add("fas", "fa-cloud");
        break;
        case "04":
            i.classList.add("fas", "fa-cloud-meatball");
        break;
        case "09":
            i.classList.add("fas", "fa-cloud-rain");
        break;
        case "10":
            if (lastChars === "d") {
                i.classList.add("fas", "fa-cloud-sun-rain");
            } else {
                i.classList.add("fas", "fa-cloud-moon-rain");
            }
        break;
        case "11":
            i.classList.add("fas", "fa-poo-storm");
        break;
        case "13":
            i.classList.add("far", "fa-snowflake");
        break;
        case "50":
            i.classList.add("fas", "fa-smog");
        break;
        default :
        i.classList.add("far", "fa-question-circle");
    }
    return i;
};

const displayCurrentConditions = (currentConditionArray) => {
    const ccContainer = document.getElementById("currentForeceast_conditions");
    currentConditionArray.forEach((cc) => {
        ccContainer.appendChild(cc);
    });
};

const displaySixDayForeceast = (weatherJson) => {
    for (let i = 1; i <= 6; i++) {
        const dfArray = createDailyForeceastDivs(weatherJson.daily[i]);
        displayDailyForeceast(dfArray);
    }
};

const createDailyForeceastDivs = (dayWeather) => {
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    const dayAbbreviation = createElem(
        "p", 
        "dayAbbreviation", 
        dayAbbreviationText
    );
    const dayIcon = createDailyForeceastIcon(
        dayWeather.weather[0].icon, 
        dayWeather.weather[0].description
    );
    const dayHigh = createElem(
        "p", 
        "dayHigh", 
        `${Math.round(Number(dayWeather.temp.max))}°`
    );
    const dayLow = createElem(
        "p",
        "dayLow",
        `${Math.round(Number(dayWeather.temp.min))}°`
    );
    return [dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data) => {
    const dateObj = new Date(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0, 3).toUpperCase();
};

const createDailyForeceastIcon = (icon, altText) => {
    const img = document.createElement('img');
    if( window.innerWidth < 768 || window.innerHeight < 1025 ) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    } else {
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = altText;
    return img;
};

const displayDailyForeceast = (dfArray) => {
    const dayDiv = createElem("div", "foreceastDay");
    dfArray.forEach((el) => {
        dayDiv.appendChild(el);
    });
    const dailyForeceastContainer = document.getElementById("dailyForeceast_contents");
    dailyForeceastContainer.appendChild(dayDiv);
};