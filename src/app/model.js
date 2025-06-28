import { convertInchesToMm } from './utils';

export default class WeatherData {
  constructor({ unit, resolvedAddress, days } = {}) {
    const [today, ...future] = days;
    this.generalInfo = WeatherData.extractInfo({ unit, resolvedAddress });
    this.todayWeather = WeatherData.extractWeather(unit, { today });
    this.forecast = WeatherData.extractForecast(future);
  }

  static extractInfo({ unit, resolvedAddress } = {}) {
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
  }

  static extractWeather({ dayInfo } = {}, convertPrecip = false) {
    return {
      icon: dayInfo.icon,
      temp: dayInfo.temp,
      maxTemp: dayInfo.tempmax,
      minTemp: dayInfo.tempmin,
      feelsLike: dayInfo.feelslike,
      desc: dayInfo.conditions,
      wind: dayInfo.windspeed,
      precip:
        convertPrecip === true
          ? convertInchesToMm(dayInfo.precip)
          : dayInfo.precip,
    };
  }

  static extractForecast(daysArr = []) {
    return daysArr.map((day) => ({
      icon: day.icon,
      temp: day.temp,
      dayName: new Date(day.datetime).toLocaleDateString(undefined, {
        weekday: 'long',
      }),
    }));
  }
}
