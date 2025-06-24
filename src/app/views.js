import dropletImage from '../svg/precip.svg';
import windImage from '../svg/wind-pwr.svg';
import capitalize from './utils';

export default class WeatherAppViewer {
  constructor(weatherData, templateElements) {
    this.generalInfo = weatherData.generalInfo;
    this.todayInfo = weatherData.todayInfo;
    this.forecast = weatherData.forecastArr;
    this.prompt = templateElements.promptElement;
    this.loader = templateElements.loaderElement;
    this.status = templateElements.statusElement;
    this.content = templateElements.contentElement;
  }

  clearContent() {
    this.content.replaceChildren();
  }

  showStatus(msg = '') {
    this.loader.style.display = 'grid';
    this.status.textContent = msg;
  }

  hideStatus(msg = '') {
    this.loader.style.display = 'none';
    this.status.textContent = msg;
  }

  showPrompt() {
    this.prompt.style.display = 'block';
  }

  hidePrompt() {
    this.prompt.style.display = 'none';
  }

  async viewCard() {
    const weatherIconModule = await import(`../svg/${this.todayInfo.icon}.svg`);
    const weatherIcon = weatherIconModule.default;
    const weatherIconAlt = `${capitalize(this.todayInfo.icon).replace(/-/g, ' ')}.`;
    const template = `
        <div class="card">
            <div class="card-top">
                <h2 class="location">${this.generalInfo.addressMain}</h2>
                <h6 class="region">${this.generalInfo.addressRest}</h6>
                <h4 class="date">${this.generalInfo.currentDate}</h4>
                <div class="card-main-details">
                    <img src="${weatherIcon}" alt="${weatherIconAlt}" class="icon icon-large" />
                    <span class="temp">${this.todayInfo.temp}&deg;</span>
                </div>
                <p>${this.todayInfo.minTemp}&deg;/${this.todayInfo.maxTemp}&deg;${'&nbsp;'.repeat(4)}Feels like: ${this.todayInfo.feelsLike}&deg;</p>
                <p>${this.todayInfo.desc}</p>
            </div>
            <div class="card-footer">
                <div class="card-footer-item">
                    <img src=${dropletImage} alt="Precipitation." class="icon icon-mid" />
                    <div class="card-footer-details">
                        <p>Precip.</p>
                        <p>${this.todayInfo.precip} mm</p>
                    </div>
                </div>
                <div class="card-footer-item">
                    <img src=${windImage} alt="Wind power." class="icon icon-mid" />
                    <div class="card-footer-details">
                        <p>Wind</p>
                        <p class="wind">${this.todayInfo.wind} ${this.generalInfo.unit === 'us' ? 'mph' : 'km/h'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    this.contentElement.innerHTML = template;
  }

  viewForecast() {
    const container = document.createElement('div');
    container.classList.add('forecast');
    const header = document.createElement('h3');
    header.textContent = `3-day forecast for ${this.generalInfo.addressMain}:`;
    container.appendChild(header);
    const list = document.createElement('ol');
    this.forecast.forEach(async (forecastObj) => {
      const weatherIconModule = import(`../svg/${forecastObj.icon}.svg`);
      const weatherIcon = weatherIconModule.default;
      const altText = capitalize(forecastObj.icon).replace(/-/g, ' ');
      const template = `
        <li>
            <span>${forecastObj.dayName}</span><span class="details"><img src=${weatherIcon} alt=${altText} class="icon icon-small" />${forecastObj.temp.toFixed(1)}&deg;</span>
        </li>
      `;
      list.insertAdjacentHTML('beforeend', template);
    });
    container.appendChild(list);
    this.targetContainer.appendChild(container);
  }
}
