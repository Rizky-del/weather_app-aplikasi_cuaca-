import { 
    setLocationObject, 
    getHomeLocation, 
    getWeatherFromCoords,
    getCoordsFromApi,
    cleanText 
} from './dataFunctions.js';
import { 
    setPlaceholderText , 
    addSpinner, 
    displayError, 
    displayApiError ,
    updateScreenReaderConfirmation,
    updateDisplay 
} from './domFunctions.js';
import CurrentLocation from "./CurrentLocation.js";
const currentLocation = new CurrentLocation();

const initApp = () => {
    // add listeners
    const geoButton = document.getElementById('getLocation');
    geoButton.addEventListener('click', getGeoWeather);

    const homeButton = document.getElementById('home');
    homeButton.addEventListener('click', loadWeather);

    const saveButton = document.getElementById('saveLocation');
    saveButton.addEventListener('click', saveLocation);

    const unitButton = document.getElementById('unit');
    unitButton.addEventListener('click', setUnitPref);

    const refreshButton = document.getElementById('refresh');
    refreshButton.addEventListener('click', refreshWeather);

    const locationEntry = document.getElementById('searchBar_form');
    locationEntry.addEventListener('submit', submitNewLocation);
    // set up
    setPlaceholderText();
    // load weather
    loadWeather();
};

document.addEventListener('DOMContentLoaded', initApp);

const getGeoWeather = (event) => {
    if (event && event.type === "click") {
        const mapIcon = document.querySelector(".fa-map-marker-alt");
        addSpinner(mapIcon);
    }

    if(!navigator.geolocation) geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
};

const geoError = (errObj) => {
    const errMsg = errObj.message ? errObj.message : "Geolocation not supported";
    displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
    const myCoordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `lat:${position.coords.latitude} lon:${position.coords.longitude}`
    };
    setLocationObject(currentLocation, myCoordsObj);
    updateDataAndDisplay(currentLocation);
};

const loadWeather = (event) => {
    const savedLocation = getHomeLocation();
    if(!savedLocation && !event ) return getGeoWeather();
    if(!savedLocation && event.type === 'click' ) {
        displayError(
            "No Home Location Saved",
            "Sorry, please save your home location first."
        );
    } else if (savedLocation && !event) {
        displayHomeLocationWeather(savedLocation);
    } else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
};

const displayHomeLocationWeather = (home) => {
    if (typeof home === "string") {
        const locationJson = JSON.parse(home);
        const myCoordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit
        };
        setLocationObject(currentLocation, myCoordsObj);
        updateDataAndDisplay(currentLocation);
    }
};

const saveLocation = () => {
    if (currentLocation.getLat() && currentLocation.getLon()) {
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);
        const location = {
            name: currentLocation.getName(),
            lat: currentLocation.getLat(),
            lon: currentLocation.getLon(),
            unit: currentLocation.getUnit()
        };
        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScreenReaderConfirmation(
            `Saved ${currentLocation.getName()} as home location`
        );
    }
};

const setUnitPref = () => {
    const unitIcon = document.querySelector('.fa-chart-bar');
    addSpinner(unitIcon);
    currentLocation.toggleUnit();
    updateDataAndDisplay(currentLocation);
};

const refreshWeather = () => {
    const refreshIcon = document.querySelector('.fa-sync-alt');
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLocation);
};

const submitNewLocation = async (event) => {
    event.preventDefault();
    const text = document.getElementById('searchBar_text').value;
    const entryText = cleanText(text);
    if(!entryText.length) return;
    const locationIcon = document.querySelector('.fa-search');
    addSpinner(locationIcon);
    const coordsData = await getCoordsFromApi(entryText, currentLocation.getUnit());
    if(coordsData) {
        if(coordsData.cod === 200) {
            // work with api data
            const myCoordsObj = {
                lat: coordsData.coord.lat,
                lon: coordsData.coord.lon,
                name: coordsData.sys.country 
                ? `${coordsData.name}, ${coordsData.sys.country}` 
                : coordsData.name
            };
            setLocationObject(currentLocation, myCoordsObj);
            updateDataAndDisplay(currentLocation);
        } else {
            displayApiError(coordsData);
        }
    } else {
        displayError("Connection Error", "Connection Error");
    }
};

const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj);
    if (weatherJson) updateDisplay(weatherJson, locationObj);
};