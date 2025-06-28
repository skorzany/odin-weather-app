import dropletImage from '../svg/precip.svg';
import windImage from '../svg/wind-pwr.svg';
import capitalize from './utils';

export default class WeatherAppViewer {
  constructor({
    promptElement,
    loaderElement,
    statusElement,
    contentElement,
  } = {}) {
    this.prompt = promptElement || document.querySelector('.prompt');
    this.loader = loaderElement || document.querySelector('.loader');
    this.status = statusElement || document.querySelector('.status');
    this.content = contentElement || document.querySelector('.content');
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

  async viewCard({ generalInfo, todayWeather } = {}) {
    const weatherIconModule = await import(`../svg/${todayWeather.icon}.svg`);
    const weatherIcon = weatherIconModule.default;
    const weatherIconAlt = `${capitalize(todayWeather.icon).replace(/-/g, ' ')}.`;
    const template = `
        <div class="card">
            <div class="card-top">
                <h2 class="location">${generalInfo.addressMain}</h2>
                <h6 class="region">${generalInfo.addressRest}</h6>
                <h4 class="date">${generalInfo.currentDate}</h4>
                <div class="card-main-details">
                    <img src="${weatherIcon}" alt="${weatherIconAlt}" class="icon icon-large" />
                    <span class="temp">${todayWeather.temp}&deg;</span>
                </div>
                <p>${todayWeather.minTemp}&deg;/${todayWeather.maxTemp}&deg;${'&nbsp;'.repeat(4)}Feels like: ${todayWeather.feelsLike}&deg;</p>
                <p>${todayWeather.desc}</p>
            </div>
            <div class="card-footer">
                <div class="card-footer-item">
                    <img src=${dropletImage} alt="Precipitation." class="icon icon-mid" />
                    <div class="card-footer-details">
                        <p>Precip.</p>
                        <p>${todayWeather.precip} mm</p>
                    </div>
                </div>
                <div class="card-footer-item">
                    <img src=${windImage} alt="Wind power." class="icon icon-mid" />
                    <div class="card-footer-details">
                        <p>Wind</p>
                        <p class="wind">${todayWeather.wind} ${generalInfo.unit === 'us' ? 'mph' : 'km/h'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    this.clearContent();
    this.content.innerHTML = template;
  }

  async viewForecast({ generalInfo, forecastArr } = {}) {
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
    this.clearContent();
    this.content.appendChild(container);
  }

  async viewAll({ generalInfo, todayWeather, forecastArr } = {}) {
    await this.viewCard({ generalInfo, todayWeather });
    this.viewForecast({ generalInfo, forecastArr });
  }
}
