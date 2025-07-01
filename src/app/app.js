import WeatherDataExtractor from './model';
import WeatherAppViewer from './views';
import { capitalize, generateTimeSpan } from './utils';

export default class WeatherApp {
  constructor({ locationElement, geoElement, mainButton, viewer } = {}) {
    this.locationElement =
      locationElement || document.getElementById('location');
    this.geoElement = geoElement || document.querySelector('.prompt');
    this.mainButton = mainButton || document.querySelector('button');
    this.viewer = viewer || new WeatherAppViewer();
  }

  collectInputs() {
    const location = this.locationElement.value;
    const unit = document.querySelector('input[type="radio"]:checked').value;
    return [location, unit];
  }

  async getWeatherData() {
    const [start, end] = generateTimeSpan(new Date(), 3);
    const [location, unit] = this.collectInputs();
    const queryTemplate = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${start}/${end}?unitGroup=${unit}&elements=datetime,tempmax,tempmin,temp,feelslike,precip,windspeed,conditions,icon&include=fcst,days&key=BFAR54V3R8J9JKYC7KE2JT5DR`;
    const msg = [];
    let data;

    this.viewer.showStatus();
    try {
      data = await fetch(queryTemplate, { mode: 'cors' });
      const json = await data.json();
      json.unit = unit;
      [json.currentWeather, ...json.days] = json.days;
      return json;
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

  async serveWeather() {
    const response = await this.getWeatherData();
    const convert = response.unit !== 'metric';
    const data = {
      generalInfo: WeatherDataExtractor.extractInfo(response),
      forecast: WeatherDataExtractor.extractForecast(response),
      currentWeather: WeatherDataExtractor.extractWeather(response, convert),
    };
    this.viewer.viewAll(data);
  }

  initialize() {
    this.locationElement.addEventListener('focus', () => {
      this.viewer.showPrompt();
    });
    this.locationElement.addEventListener('blur', () => {
      this.viewer.hidePrompt();
    });
    this.geoElement.addEventListener('mousedown', () => {
      this.provideLocation();
    });
    this.mainButton.addEventListener('click', () => {
      this.serveWeather();
    });
  }
}
