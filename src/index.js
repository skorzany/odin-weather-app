import './styles/reset.css';
import './styles/styles.css';
import {
  clearContent,
  collectInputs,
  displayStatus,
  getWeatherData,
  provideLocation,
  processOutput,
  clearStatus,
  displayMainCard,
  displayForecast,
} from './app/app';

const btn = document.querySelector('button');
const input = document.getElementById('location');
const prompt = document.querySelector('.prompt');

async function run() {
  displayStatus('Processing...');
  const inputs = collectInputs();
  const response = await getWeatherData(inputs);
  const results = processOutput(response);
  if (results.length) {
    clearStatus();
    clearContent();
    await displayMainCard(results[0], results[1]);
    displayForecast(results[0], results[2]);
  }
}

window.onload = () => {
  input.value = '';
};
input.addEventListener('focus', () => {
  prompt.style.display = 'block';
});
input.addEventListener('blur', () => {
  prompt.style.display = 'none';
});
prompt.addEventListener('mousedown', () => {
  displayStatus('Locating...');
  provideLocation(input);
});
btn.addEventListener('click', run);
