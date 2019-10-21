// Vendor
const {ipcRenderer} = require('electron');
const settings = require('electron-settings');

// Services
const {fetchStashItems} = require('../services/stash-items');
const {aggregateChaosRecipe} = require('../services/chaos-recipe');
const {fetchCurrentLeague} = require('../services/active-leagues');

// Constants
const POLLING_DELAY = 60000; // 1 minute

const refreshChaosRecipe = async () => {
  const updateIndicator = (indicatorId, {isDanger, isWarning, totalCount}) => {
    const slotElement = document.getElementById(indicatorId);
    const imageElement = slotElement.querySelector('img');
    const valueElement = slotElement.querySelector('span');

    imageElement.classList.remove('danger');
    imageElement.classList.remove('warning');

    if (isWarning) imageElement.classList.add('warning');
    if (isDanger) imageElement.classList.add('danger');

    valueElement.textContent = totalCount;
  };

  const {league: leagueSetting, account, sessionId, stashIds} = settings.get('user');
  const league = await fetchCurrentLeague(leagueSetting);

  try {
    const stashItems = await fetchStashItems(stashIds, {league, account, sessionId});
    const chaosRecipe = aggregateChaosRecipe(stashItems);

    updateIndicator('hand', chaosRecipe.hand);
    updateIndicator('bodyArmour', chaosRecipe.bodyArmour);
    updateIndicator('helmet', chaosRecipe.helmet);
    updateIndicator('glove', chaosRecipe.glove);
    updateIndicator('boot', chaosRecipe.boot);
    updateIndicator('belt', chaosRecipe.belt);
    updateIndicator('ring', chaosRecipe.ring);
    updateIndicator('amulet', chaosRecipe.amulet);
  } catch (error) {
    console.log("Overlay poll error", error);
  }
};

document.getElementById('settings-button').onclick = () => {
  ipcRenderer.send('openSettings');
};

ipcRenderer.on('forceChaosRecipeRefresh', () => refreshChaosRecipe());
setInterval(() => refreshChaosRecipe(), POLLING_DELAY);
refreshChaosRecipe();
