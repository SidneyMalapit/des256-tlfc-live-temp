import {
  FridgeData,
  getAllTemperatures
} from'./temp-request-functions.ts';
import logoUrl from './assets/TLFC-logo-vector.svg';
import bgFridgeUrl from './assets/LOVE-FRIDGE_OK4.svg';
import './style.css';

// from https://stackoverflow.com/a/67243723
const kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());

// wait for things to load
await new Promise((resolve) => addEventListener('DOMContentLoaded', resolve));

async function loadCards() {
  const table = document.getElementById('fridge-data-table')!;
  {
    let fridge: Element | null;
    while (fridge = table.querySelector('.fridge-data-container')) {
      fridge.remove();
    }
  }

  for (const fridgeData of (await getAllTemperatures())) {
    const container = document.createElement('article');
    container.classList.add('fridge-data-container');
    if (fridgeData.temperature > 40) {
      container.classList.add('needs-attention');
    } else if (fridgeData.temperature > 38) {
      container.classList.add('warning');
    } else if (fridgeData.temperature <= 32) {
      container.classList.add('freezing');
    }

    for (const key of ['name', 'temperature', 'lastUpdated'] as (keyof FridgeData)[]) {
      let value = fridgeData[key];

      const element = document.createElement('span');
      element.classList.add(`fridge-${kebabize(key)}`);

      if (key === 'temperature') {
        element.textContent = `${value}\u00b0F (${fridgeData.temperatureCelsius.toString()}\u00b0C)`;
      } else if (value instanceof Date) {
        const dateTypes = {
          time: value.toLocaleTimeString(navigator.language, { hour: 'numeric', minute: 'numeric' }),
          dateTime: value.toLocaleString(),
          extended: value.toString(),
        };

        const diff = Date.now() - value.getTime();
        let time: number;

        if (diff < 60 * 1000) {
          dateTypes.time = 'second';
          time = diff / 1000;
        } else if (diff < 60 * 60 * 1000) {
          dateTypes.time = 'minute';
          time = diff / 1000 / 60;
        } else if (diff <= 24 * 60 * 60 * 1000) {
          dateTypes.time = 'hour';
          time = diff / 1000 / 60 / 60;
        } else {
          dateTypes.time = 'more than a day';
          time = NaN;
        }
        time = Math.floor(time);
        dateTypes.time = `${isNaN(time) ? '' : (time + ' ')}${dateTypes.time}${time === 1 || isNaN(time) ? '' : 's'} ago`;

        for (const dateStringType in dateTypes) {
          const dateString = dateTypes[dateStringType as keyof typeof dateTypes];

          if (dateStringType === 'extended') {
            element.setAttribute('title', dateString);
            continue;
          }

          const formatSpan = document.createElement('span');
          formatSpan.classList.add('fridge-' + kebabize(dateStringType));
          formatSpan.textContent = dateString;
          element.append(formatSpan);
        }
      } else { element.textContent = value.toString(); }

      container.append(element);
    }

    table.append(container);
  }
}

loadCards();

// auto update every 5 minutes
setInterval(loadCards, 1000 * 60 * 5);

document.getElementById('reload')?.addEventListener('click', loadCards);

const logo = document.querySelector<HTMLImageElement>('#logo');
if (logo) { logo.src = logoUrl; }
const bgImage = document.querySelector<HTMLImageElement>('#bg-fridge-guy');
if (bgImage) { bgImage.src = bgFridgeUrl; }
