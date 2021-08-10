const main = ( () => {
    const navbar = document.querySelector('nav');
    const searchbar = document.querySelector('#searchbar');
    const searchPlaceBtn = document.querySelector('#search-btn');
    const switchUnitsBtn = document.querySelector('#switch-units-btn');

    let unitsMetric = true;
    let lastPlaceLooked = '';

    searchPlaceBtn.addEventListener('click', lookForData)

    function showWeatherInfo(place, currentWeData, dailyWeData) {
        removeWeatherInfo(); // If there is already info. on the screen, remove it first.

        navbar.insertAdjacentHTML('afterend', `
        <div class="weather-container">
            <h2 class="place-info">${place}, ${currentWeData['country']}</h2>
            <div class="current-weather-container">
                <div class="temp-info">
                    <p id="current-temp">${currentWeData['main']['temp']}${unitsMetric? '°C':'°F'}</p>
                    <p class="info-text">Feels Like</p>
                    <p id="current-temp-feels">${currentWeData['main']['feels_like']}${unitsMetric? '°C':'°F'}</p>
                </div>
                <div class="temp-img-container">
                    <img id="weather-img" width="70px" height="70px" src="https://openweathermap.org/img/wn/${currentWeData['weather_icon']}@4x.png">
                    <p id="weather-img-desc" class="info-text">${currentWeData['weather_desc']}</p>
                </div>
                <div class="extra-weather-info">
                    <div id="column1" class="column">
                        <div class="info-container">
                            <p class="info-text"><nobr>Max. Temp</nobr></p>
                            <p class="value">${currentWeData['main']['temp_max']}${unitsMetric? '°C':'°F'}</p>
                        </div>
                        <div class="info-container">
                            <p class="info-text"><nobr>Min. Temp</nobr></p>
                            <p class="value">${currentWeData['main']['temp_min']}${unitsMetric? '°C':'°F'}</p>
                        </div>
                    </div>
                    <div id="column2" class="column"> 
                        <div class="info-container">
                            <p class="info-text">Humidity</p>
                            <p class="value">${currentWeData['main']['humidity']}%</p>
                        </div>
                        <div class="info-container">
                            <p class="info-text">Pressure</p>
                            <p class="value">${currentWeData['main']['pressure']}hPa</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="daily-weather-container">
            </div>
        </div>
        `);

        const dailyWeatherContainer = document.querySelector('.daily-weather-container');
        let iDayData;

        for (let i = 0; i < 5; i++) {
            iDayData = dailyWeData[i];

            dailyWeatherContainer.insertAdjacentHTML('beforeend', `
            <div id="day${i+1}" class="daily-weather-info">
                <p class="weather-date">25/07</p>
                <img src="https://openweathermap.org/img/wn/${iDayData['weather_icon']}@4x.png" height="70" width="70">
                <p class="temp-info-daily">Max. Temp</p>
                <p class="temp-value-daily">${iDayData['max']}${unitsMetric? '°C':'°F'}</p>
                <p class="temp-info-daily">Min. Temp</p>
                <p class="temp-value-daily">${iDayData['min']}${unitsMetric? '°C':'°F'}</p>
            </div>
            `);
        }
    }

    async function lookForData() {
        const currWD = await apiFetchFns.getCurrentWeatherData(`${searchbar.value}`, unitsMetric);
        const currWDProc = apiFetchFns.processCurrWeatherData(currWD);
        lastPlaceLooked = searchbar.value;

        const dailyWD = await apiFetchFns.getDailyWeatherData(currWDProc['coords']['lat'], currWDProc['coords']['lon'], unitsMetric);
        const dailyWDProc = apiFetchFns.processDailyWeatherData(dailyWD);
    
        showWeatherInfo(searchbar.value, currWDProc, dailyWDProc);
    }

    function removeWeatherInfo() {
        const weatherContainer = document.querySelector('.weather-container');

        if (weatherContainer) {
            weatherContainer.remove();
        }
    }
})();

const apiFetchFns = ( () => {
    async function getCurrentWeatherData(place, unitsMetric) {
        try {
            let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=98e414fdc44ed3146e554aae7865b07e&units=${unitsMetric == true? 'metric':'imperial'}`);
            
            let jsonResp = await response.json();

            return jsonResp;
        }
        catch(error) {
            console.log("There has been an error: ", error);
        }
    }

    async function getDailyWeatherData(lat, lon, unitsMetric) {
        try {
            
            let response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=98e414fdc44ed3146e554aae7865b07e&units=${unitsMetric == true? 'metric':'imperial'}`);
            
            let jsonResp = await response.json();

            return jsonResp;
        }
        catch {
            console.log("There has been an error: ", error);
        }
    }

    function processCurrWeatherData(data) {
        return {
            coords: data['coord'],
            main: data['main'],
            country: data['sys']['country'],
            'weather_desc': data['weather'][0]['description'],
            'weather_icon': data['weather'][0]['icon']
        }
    }

    function processDailyWeatherData(data) {
        let dailyWeatherData = [];
        let iDayData;

        for (let i = 1; i <= 5; i++) {
            iDayData = data['daily'][i];

            dailyWeatherData.push(
                {
                    max: iDayData['temp']['max'],
                    min: iDayData['temp']['min'],
                    'weather_icon': iDayData['weather'][0]['icon']
                }
            )
        }

        return dailyWeatherData;
    }

    return {getCurrentWeatherData, processCurrWeatherData, getDailyWeatherData, processDailyWeatherData}
})();