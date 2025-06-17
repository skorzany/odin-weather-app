import './styles/reset.css';
import './styles/styles.css';
import {
  collectInputs,
  displayStatus,
  getWeatherData,
  processOutput,
  clearStatus,
} from './app/app';

const btn = document.querySelector('button');

async function run() {
  displayStatus('Processing...');
  const inputs = collectInputs();
  const response = await getWeatherData(inputs);
  const results = processOutput(response);
  if (results.length) clearStatus();
  console.log(results);
}

btn.addEventListener('click', run);
