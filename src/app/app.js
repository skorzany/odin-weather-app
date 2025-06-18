import dropletImage from '../svg/precip.svg';
import windImage from '../svg/wind-pwr.svg';

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

function convertInchesToMm(inches) {
  return Number((inches * 25.4).toPrecision(1));
}

function collectInputs() {
  const location = document.getElementById('location').value;
  const unit = document.querySelector('input[type="radio"]:checked').value;

  return { location, unit };
}

function displayStatus(status) {
  const targetElement = document.querySelector('p.error-msg');
  targetElement.textContent = status;
}

function clearStatus() {
  document.querySelector('p.error-msg').textContent = '';
}

async function getWeatherData(inputs) {
  // I have removed the api key for now so no bots would steal it...
  const queryTemplate = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${inputs.location}/?unitGroup=${inputs.unit}&key=BFAR54V3R8J9JKYC7KE2JT5DR`;
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

function processOutput(json) {
  if (!json) return [];
  const [city, region, country] = json.resolvedAddress.split(', ');
  const [today, ...future] = json.days.slice(0, 4);
  // universal data
  const generalInfo = {
    city,
    region,
    country,
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
  // TODO: find how to dynamically import specific svg and put it into template
  // const weatherIcon = await fetch(`../svg/${todayInfo.icon}.svg`);
  const template = `
    <div class="card">
    <div class="card-top">
      <h2 class="location">${generalInfo.city}</h2>
      <h3 class="date">${generalInfo.currentDate}</h3>
      <div class="card-main-details">
        <img src=${weatherIcon} alt="" class="icon icon-large" />
        <span class="temp">${todayInfo.temp}&deg;</span>
      </div>
      <p>${todayInfo.maxTemp}&deg;/${todayInfo.minTemp}&deg; Odczucie ${todayInfo.feelsLike}&deg;</p>
      <p>${todayInfo.desc}</p>
    </div>
    <div class="card-footer">
      <div class="card-footer-item">
        <img src=${dropletImage} alt="" class="icon icon-mid" />
        <div class="card-footer-details">
          <p>Opady atmosferyczne</p>
          <p class="precip">${todayInfo.precip} mm</p>
        </div>
      </div>
      <div class="card-footer-item">
        <img src=${windImage} alt="" class="icon icon-mid" />
        <div class="card-footer-details">
          <p>Wiatr</p>
          <p class="wind">${todayInfo.wind} km/h</p>
        </div>
      </div>
    </div>
  </div>
  `;
  targetElement.innerHTML += template;
}

export {
  collectInputs,
  displayStatus,
  getWeatherData,
  processOutput,
  clearStatus,
  displayMainCard,
};
