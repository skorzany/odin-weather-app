function collectInputs() {
  const location = document.getElementById('location').value;
  const unit = document.querySelector('input[type="radio"]:checked').value;

  return { location, unit };
}

async function getWeatherData(inputs) {
  // I have removed the api key for now so no bots would steal it...
  const queryTemplate = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${inputs.location}/?unitGroup=${inputs.unit}&key=#`;
  try {
    const data = await fetch(queryTemplate, { mode: 'cors' });
    const json = await data.json();
    json.unit = inputs.unit;
    return json;
  } catch (error) {
    console.log('err', error);
  }
}

function processOutput(json) {
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
        ? Number((today.precip * 25.4).toPrecision(2))
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

export { collectInputs, getWeatherData, processOutput };
