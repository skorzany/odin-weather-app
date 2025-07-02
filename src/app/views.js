import dropletImage from '../svg/precip.svg';
import windImage from '../svg/wind-pwr.svg';
import { capitalize } from './utils';

export default class WeatherAppViewer {
  constructor({
    promptElement,
    loaderElement,
    statusElement,
    cardElement,
    forecastElement,
  } = {}) {
    this.prompt = promptElement || document.querySelector('.prompt');
    this.loader = loaderElement || document.querySelector('.loader');
    this.status = statusElement || document.querySelector('.status');
    this.card = cardElement || document.querySelector('.card');
    this.forecast = forecastElement || document.querySelector('.forecast');
  }

  showStatus(msg = '') {
    this.loader.style.visibility = 'visible';
    this.status.textContent = msg;
  }

  hideStatus(msg = '') {
    this.loader.style.visibility = 'hidden';
    this.status.textContent = msg;
  }

  showPrompt() {
    this.prompt.style.display = 'block';
  }

  hidePrompt() {
    this.prompt.style.display = 'none';
  }

  async viewCard({ generalInfo, currentWeather } = {}) {
    if ([generalInfo, currentWeather].some((x) => Object.keys(x).length === 0))
      return;
    const weatherIconModule = await import(`../svg/${currentWeather.icon}.svg`);
    const weatherIcon = weatherIconModule.default;
    const weatherIconAlt = `${capitalize(currentWeather.icon).replace(/-/g, ' ')}.`;
    const template = `
      <div class="card-top">
          <h2 class="location">${generalInfo.addressMain}</h2>
          <h6 class="region">${generalInfo.addressRest}</h6>
          <h4 class="date">${generalInfo.currentDate}</h4>
          <div class="card-main-details">
              <img src="${weatherIcon}" alt="${weatherIconAlt}" class="icon icon-large" />
              <span class="temp">${currentWeather.temp}&deg;</span>
          </div>
          <p>${currentWeather.minTemp}&deg;/${currentWeather.maxTemp}&deg;${'&nbsp;'.repeat(4)}Feels like: ${currentWeather.feelsLike}&deg;</p>
          <p>${currentWeather.desc}</p>
      </div>
      <div class="card-footer">
          <div class="card-footer-item">
              <img src=${dropletImage} alt="Precipitation." class="icon icon-mid" />
              <div class="card-footer-details">
                  <p>Precip.</p>
                  <p>${currentWeather.precip} mm</p>
              </div>
          </div>
          <div class="card-footer-item">
              <img src=${windImage} alt="Wind power." class="icon icon-mid" />
              <div class="card-footer-details">
                  <p>Wind</p>
                  <p class="wind">${currentWeather.wind} ${generalInfo.unit === 'us' ? 'mph' : 'km/h'}</p>
              </div>
          </div>
      </div>
    `;
    this.card.innerHTML = template;
    this.card.style.display = 'flex';
  }

  async viewForecast({ generalInfo, forecast } = {}) {
    if (Object.keys(generalInfo).length === 0 || forecast.length === 0) return;
    this.forecast.replaceChildren();
    const header = document.createElement('h3');
    header.textContent = `${forecast.length}-day forecast for ${generalInfo.addressMain}:`;
    this.forecast.appendChild(header);
    const list = document.createElement('ol');
    const icons = await Promise.all(
      forecast.map((obj) => import(`../svg/${obj.icon}.svg`))
    );
    forecast.forEach((obj, idx) => {
      const altText = capitalize(obj.icon).replace(/-/g, ' ');
      const icon = icons[idx].default;
      const template = `
        <li>
          <span>${obj.dayName}</span><span class="details"><img src="${icon}" alt="${altText}" class="icon icon-small" />${obj.temp}&deg;</span>
        </li>
      `;
      list.insertAdjacentHTML('beforeend', template);
    });
    this.forecast.appendChild(list);
  }

  async viewAll({ generalInfo, currentWeather, forecast } = {}) {
    await this.viewCard({ generalInfo, currentWeather });
    this.viewForecast({ generalInfo, forecast });
  }
}
