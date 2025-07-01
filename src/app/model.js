import { convertInchesToMm } from './utils';

export default class WeatherDataExtractor {
  static extractInfo({ unit, resolvedAddress } = {}) {
    try {
      const addressParts = resolvedAddress.split(', ');
      const [addressMain, ...addressRest] = addressParts;
      return {
        unit,
        addressMain,
        addressRest: addressRest.join(', '),
        currentDate: new Date().toLocaleString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        }),
      };
    } catch {
      return {};
    }
  }

  static extractWeather({ currentWeather } = {}, convertPrecip = false) {
    try {
      return {
        icon: currentWeather.icon,
        temp: currentWeather.temp,
        maxTemp: currentWeather.tempmax,
        minTemp: currentWeather.tempmin,
        feelsLike: currentWeather.feelslike,
        desc: currentWeather.conditions,
        wind: currentWeather.windspeed.toFixed(1),
        precip: (convertPrecip
          ? convertInchesToMm(currentWeather.precip)
          : currentWeather.precip
        ).toFixed(1),
      };
    } catch {
      return {};
    }
  }

  static extractForecast({ days } = {}) {
    try {
      return days.map((day) => ({
        icon: day.icon,
        temp: day.temp.toFixed(1),
        dayName: new Date(day.datetime).toLocaleDateString(undefined, {
          weekday: 'long',
        }),
      }));
    } catch {
      return [];
    }
  }
}
