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
  const updateIndicator = (indicatorId, {isDanger, isWarning}) => {
    const imageElement = document.getElementById(indicatorId);

    imageElement.classList.remove('danger');
    imageElement.classList.remove('warning');

    if (isDanger) return imageElement.classList.add('danger');
    if (isWarning) return imageElement.classList.add('warning');
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

    const totalSummaryElement = document.getElementById('total-summary');
    totalSummaryElement.innerText = `${chaosRecipe._meta.totalCount}x`;
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
