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
  const msg = Error.isError(status) ? `Error: ${status.message}` : status;
  targetElement.textContent = msg;
}

function clearStatus() {
  document.querySelector('p.error-msg').textContent = '';
}

async function getWeatherData(inputs) {
  // I have removed the api key for now so no bots would steal it...
  const queryTemplate = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${inputs.location}/?unitGroup=${inputs.unit}&key=#`;
  try {
    const data = await fetch(queryTemplate, { mode: 'cors' });
    if (data.status === 404) {
      throw new Error('No location provided.');
    } else if (data.status === 400) {
      throw new Error(`Invalid location: '${capitalize(inputs.location)}'.`);
    } else if (data.status !== 200) {
      throw new Error('Something went wrong.');
    }
    const json = await data.json();
    json.unit = inputs.unit;
    return json;
  } catch (error) {
    displayStatus(error);
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

  return [generalInfo, todayInfo, ...nextInfo];
}

export {
  collectInputs,
  displayStatus,
  getWeatherData,
  processOutput,
  clearStatus,
};
