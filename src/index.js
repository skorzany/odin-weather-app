import './styles/reset.css';
import './styles/styles.css';
import {
  clearContent,
  collectInputs,
  displayStatus,
  getWeatherData,
  processOutput,
  clearStatus,
  displayMainCard,
  displayForecast,
} from './app/app';

const btn = document.querySelector('button');
const input = document.getElementById('location');

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
btn.addEventListener('click', run);
