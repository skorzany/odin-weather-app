import dropletImage from '../svg/precip.svg';
import windImage from '../svg/wind-pwr.svg';

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const clearContent = () => document.querySelector('.content').replaceChildren();

function convertInchesToMm(inches) {
  return Number((inches * 25.4).toPrecision(1));
}

function collectInputs() {
  const location = document.getElementById('location').value;
  const unit = document.querySelector('input[type="radio"]:checked').value;

  return { location, unit };
}

function displayStatus(status) {
  const targetElement = document.querySelector('.status');
  targetElement.textContent = status || '';
}

function clearStatus() {
  document.querySelector('.status').textContent = '';
}

async function getWeatherData(inputs) {
  // I have removed the api key for now so no bots would steal it...
  const queryTemplate = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${inputs.location}/?unitGroup=${inputs.unit}&key=#`;
  let data;
  try {
    data = await fetch(queryTemplate, { mode: 'cors' });
    const json = await data.json();
    json.unit = inputs.unit;
    return json;
  } catch {
    let msg = 'Error: ';
    if (data.status === 404) {
      msg += 'No location provided.';
    } else if (data.status === 400) {
      msg += `Invalid location: '${capitalize(inputs.location)}'.`;
    } else {
      msg += 'Something went wrong.';
    }
    displayStatus(msg);
    return false;
  }
}

function provideLocation() {
  const success = (position) => {
    document.getElementById('location').value =
      `${position.coords.latitude}, ${position.coords.longitude}`;
    displayStatus();
  };
  const error = () => displayStatus('Unable to retrieve your location.');
  if (!navigator.geolocation) {
    displayStatus('Geolocation is not supported by your browser.');
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

function processOutput(json) {
  if (!json) return [];
  const addressParts = json.resolvedAddress.split(', ');
  const [addressMain, ...addressRest] = addressParts;
  const [today, ...future] = json.days.slice(0, 4);
  // universal data
  const generalInfo = {
    addressMain,
    addressRest: addressRest.join(', '),
    unit: json.unit,
    currentDate: new Date().toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }),
  };
  // current day
  const todayInfo = {
    icon: today.icon,
    temp: today.temp,
    maxTemp: today.tempmax,
    minTemp: today.tempmin,
    feelsLike: today.feelslike,
    desc: today.conditions,
    precip:
      generalInfo.unit === 'us'
        ? convertInchesToMm(today.precip)
        : today.precip,
    wind: today.windspeed,
  };
  // next 3 days
  const nextInfo = future.map((day) => ({
    dayName: new Date(day.datetime).toLocaleDateString(undefined, {
      weekday: 'long',
    }),
    icon: day.icon,
    temp: day.temp,
  }));

  return [generalInfo, todayInfo, nextInfo];
}

async function displayMainCard(generalInfo, todayInfo) {
  const targetElement = document.querySelector('.content');
  const weatherIconModule = await import(`../svg/${todayInfo.icon}.svg`);
  const weatherIcon = weatherIconModule.default;
  const weatherIconAlt = `${capitalize(todayInfo.icon).split('-').join(' ')}.`;
  const template = `
  <div class="card">
    <div class="card-top">
      <h2 class="location">${generalInfo.addressMain}</h2>
      <h6 class="region">${generalInfo.addressRest}</h6>
      <h4 class="date">${generalInfo.currentDate}</h4>
      <div class="card-main-details">
        <img src="${weatherIcon}" alt="${weatherIconAlt}" class="icon icon-large" />
        <span class="temp">${todayInfo.temp}&deg;</span>
      </div>
      <p>${todayInfo.minTemp}&deg;/${todayInfo.maxTemp}&deg;${'&nbsp;'.repeat(4)}Feels like: ${todayInfo.feelsLike}&deg;</p>
      <p>${todayInfo.desc}</p>
    </div>
    <div class="card-footer">
      <div class="card-footer-item">
        <img src=${dropletImage} alt="Precipitation." class="icon icon-mid" />
        <div class="card-footer-details">
          <p>Precip.</p>
          <p>${todayInfo.precip} mm</p>
        </div>
      </div>
      <div class="card-footer-item">
        <img src=${windImage} alt="Wind power." class="icon icon-mid" />
        <div class="card-footer-details">
          <p>Wind</p>
          <p class="wind">${todayInfo.wind} ${generalInfo.unit === 'us' ? 'mph' : 'km/h'}</p>
        </div>
      </div>
    </div>
  </div>
  `;
  targetElement.innerHTML += template;
}

function displayForecast(generalInfo, forecastArr) {
  const targetElement = document.querySelector('.content');
  const container = document.createElement('div');
  container.classList.add('forecast');
  const header = document.createElement('h3');
  header.textContent = `3-day forecast for ${generalInfo.addressMain}:`;
  container.appendChild(header);
  const list = document.createElement('ol');
  forecastArr.forEach(async (forecastObj) => {
    const weatherIconModule = await import(`../svg/${forecastObj.icon}.svg`);
    const weatherIcon = weatherIconModule.default;
    const altText = capitalize(forecastObj.icon).split('-').join(' ');
    const template = `
    <li>
      <span>${forecastObj.dayName}</span><span class="details"><img src="${weatherIcon}" alt="${altText}" class="icon icon-small" />${forecastObj.temp.toFixed(1)}&deg;</span>
    </li>
    `;
    list.insertAdjacentHTML('beforeend', template);
  });
  container.appendChild(list);
  targetElement.appendChild(container);
}

export {
  clearContent,
  collectInputs,
  displayStatus,
  getWeatherData,
  provideLocation,
  processOutput,
  clearStatus,
  displayMainCard,
  displayForecast,
};
