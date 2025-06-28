import dropletImage from '../svg/precip.svg';
import windImage from '../svg/wind-pwr.svg';
import { capitalize, convertInchesToMm } from './utils';
import WeatherAppViewer from './views';

// VIEWER
const clearContent = () => document.querySelector('.content').replaceChildren();

function showLoader(msg = '') {
  document.querySelector('.loader').style.visibility = 'visible';
  document.querySelector('.status').textContent = msg;
}

function hideLoader(msg = '') {
  document.querySelector('.loader').style.visibility = 'hidden';
  document.querySelector('.status').textContent = msg;
}

function showPrompt() {
  document.querySelector('.prompt').style.display = 'block';
}

function hidePrompt() {
  document.querySelector('.prompt').style.display = 'none';
}

async function displayMainCard(generalInfo, todayInfo) {
  const targetElement = document.querySelector('.content');
  const weatherIconAlt = `${capitalize(todayInfo.icon).split('-').join(' ')}.`;
  const weatherIconModule = await import(`../svg/${todayInfo.icon}.svg`);
  const weatherIcon = weatherIconModule.default;
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

async function displayForecast(generalInfo, forecastArr) {
  const targetElement = document.querySelector('.content');
  const container = document.createElement('div');
  container.classList.add('forecast');
  const header = document.createElement('h3');
  header.textContent = `3-day forecast for ${generalInfo.addressMain}:`;
  container.appendChild(header);
  const list = document.createElement('ol');
  const icons = await Promise.all(
    forecastArr.map((obj) => import(`../svg/${obj.icon}.svg`))
  );
  forecastArr.forEach((obj, idx) => {
    const altText = capitalize(obj.icon).replace(/-/g, ' ');
    const icon = icons[idx].default;
    const template = `
      <li>
        <span>${obj.dayName}</span><span class="details"><img src="${icon}" alt="${altText}" class="icon icon-small" />${obj.temp.toFixed(1)}&deg;</span>
      </li>
    `;
    list.insertAdjacentHTML('beforeend', template);
  });
  container.appendChild(list);
  targetElement.appendChild(container);
}

// MODEL
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

// CONTROLLER
function collectInputs() {
  const location = document.getElementById('location').value;
  const unit = document.querySelector('input[type="radio"]:checked').value;
  return { location, unit };
}

async function getWeatherData(inputs) {
  // I have removed the api key for now so no bots would steal it...
  const queryTemplate = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${inputs.location}/?unitGroup=${inputs.unit}&key=#`;
  const msg = [];
  let data;

  showLoader();
  try {
    data = await fetch(queryTemplate, { mode: 'cors' });
    const json = await data.json();
    json.unit = inputs.unit;
    return json;
  } catch {
    msg.push('Error: ');
    if (data.status === 404) {
      msg.push('No location provided.');
    } else if (data.status === 400) {
      msg.push(`Invalid location: '${capitalize(inputs.location)}'.`);
    } else {
      msg.push('Something went wrong.');
    }
    return false;
  } finally {
    hideLoader(msg.join(''));
  }
}

function provideLocation() {
  const success = (position) => {
    hideLoader();
    document.getElementById('location').value =
      `${position.coords.latitude}, ${position.coords.longitude}`;
  };
  const error = () => {
    hideLoader('Error: Unable to retrieve your location.');
  };

  showLoader();
  if (!navigator.geolocation) {
    hideLoader('Error: Geolocation is not supported by your browser.');
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

export {
  clearContent,
  showPrompt,
  hidePrompt,
  collectInputs,
  getWeatherData,
  provideLocation,
  processOutput,
  displayMainCard,
  displayForecast,
};

class WeatherApp {
  constructor({ locationElement, geoElement, mainButton, viewer } = {}) {
    this.locationElement =
      locationElement || document.getElementById('location');
    this.geoElement = geoElement || document.querySelector('.prompt');
    this.mainButton = mainButton || document.querySelector('button');
    this.viewer = viewer || new WeatherAppViewer();
    this.data = undefined;
  }

  collectInputs() {
    const location = this.locationElement.value;
    const unit = document.querySelector('input[type="radio"]:checked').value;
    return [location, unit];
  }

  async getWeatherData() {
    const [location, unit] = this.collectInputs();
    const queryTemplate = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/?unitGroup=${unit}&key=#`;
    const msg = [];
    let data;

    this.viewer.showStatus();
    try {
      data = await fetch(queryTemplate, { mode: 'cors' });
      const json = await data.json();
      return { unit, resolvedAddress: json.resolvedAddress, days: json.days };
    } catch {
      msg.push('Error:');
      if (data.status === 404) {
        msg.push('No location provided.');
      } else if (data.status === 400) {
        msg.push(`Invalid location: '${capitalize(location)}'.`);
      } else msg.push('Something went wrong.');
      return {};
    } finally {
      this.viewer.hideStatus(msg.join(' '));
    }
  }

  provideLocation() {
    const success = (position) => {
      this.viewer.hideStatus();
      this.locationElement.value = `${position.coords.latitude}, ${position.coords.longitude}`;
    };
    const failure = () =>
      this.viewer.hideStatus('Error: Unable to retrieve your location.');

    this.viewer.showStatus();
    if (!navigator.geolocation) {
      this.viewer.hideStatus(
        'Error: Geolocation is not supported by your browser.'
      );
    } else {
      navigator.geolocation.getCurrentPosition(success, failure);
    }
  }

  run() {
    this.locationElement.addEventListener('focus', this.viewer.showPrompt);
    this.locationElement.addEventListener('blur', this.viewer.hidePrompt);
    this.geoElement.addEventListener('mousedown', this.provideLocation);
    this.mainButton.addEventListener('click', x); // TODO: Add a procedure to serve content
  }
}
