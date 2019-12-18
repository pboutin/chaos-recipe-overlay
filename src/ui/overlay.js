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
    const valueElement = slotElement.querySelector('span');

    slotElement.classList.remove('danger');
    slotElement.classList.remove('warning');

    if (isDanger) {
      slotElement.classList.add('danger');
    } else if (isWarning) {
      slotElement.classList.add('warning');
    }

    valueElement.textContent = totalCount;
  };

  const updateAppStatus = async (apiStatus) => {
    const statusElement = document.getElementById('status');
    statusElement.textContent = apiStatus ? '' : 'PoE API is down, please wait.';
  }

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
    updateAppStatus(true);
  } catch (error) {
    updateAppStatus(false);
    console.log("Overlay poll error", error);
  }
};

ipcRenderer.on('forceChaosRecipeRefresh', () => refreshChaosRecipe());
setInterval(() => refreshChaosRecipe(), POLLING_DELAY);
refreshChaosRecipe();
