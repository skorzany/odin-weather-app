import './styles/reset.css';
import './styles/styles.css';
import { collectInputs, getWeatherData, processOutput } from './app/app';

const btn = document.querySelector('button');

async function run() {
  const inputs = collectInputs();
  const response = await getWeatherData(inputs);
  const results = processOutput(response);
  console.log(results);
}

btn.addEventListener('click', run);
