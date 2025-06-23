import './styles/reset.css';
import './styles/styles.css';
import {
  clearContent,
  showPrompt,
  hidePrompt,
  collectInputs,
  getWeatherData,
  provideLocation,
  processOutput,
  displayMainCard,
  displayForecast,
} from './app/app';

const btn = document.querySelector('button');
const input = document.getElementById('location');
const prompt = document.querySelector('.prompt');

async function run() {
  const inputs = collectInputs();
  const response = await getWeatherData(inputs);
  const results = processOutput(response);
  if (results.length) {
    clearContent();
    await displayMainCard(results[0], results[1]);
    displayForecast(results[0], results[2]);
  }
}

window.onload = () => {
  input.value = '';
};
input.addEventListener('focus', showPrompt);
input.addEventListener('blur', hidePrompt);
prompt.addEventListener('mousedown', () => {
  provideLocation(input);
});
btn.addEventListener('click', run);
