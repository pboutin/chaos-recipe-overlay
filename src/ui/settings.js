// Vendor
const {ipcRenderer} = require('electron');
const settings = require('electron-settings');

// Services
const {fetchStashTabs} = require('../services/stash-tabs');
const {fetchActiveLeagues} = require('../services/active-leagues');

const refreshStashTabs = async () => {
  const {league, account, sessionId} = settings.get('user');
  if (!league || !account || !sessionId) return;

  const selectedStashIds = settings.get('user.stashIds') || [];
  const tabsElement = document.getElementById('tabs');

  try {
    const stashTabs = await fetchStashTabs({league, account, sessionId});

    const tabsHtml = stashTabs.reduce((acc, stashTab) => {
      const isSelected = selectedStashIds.includes(stashTab.id);

      return acc + `
      <button
        class="d-flex align-items-center justify-content-left btn btn-${isSelected ? 'success' : 'primary'} btn-block"
        data-id="${stashTab.id}"
        ${!stashTab.isValid && 'disabled'}
      >
        <div class="stash-color" style="background-color: ${stashTab.colorCss}"></div>
        ${stashTab.name}
      </button>      
    `;
    }, '');

    tabsElement.innerHTML = `
      <label>Stash tabs to scan</label>
      ${tabsHtml}
    `;
  } catch (error) {
    tabsElement.innerHTML = `
      <div class="alert alert-danger">
        <h4 class="alert-heading">Something went wrong 😬</h4>
        <p>${error.options.uri}</p>
        <p>Status: ${error.statusCode}</p>
      </div>
    `;
  }
};

document.getElementById('tabs').onclick = (event) => {
  const stashButtonElement = event.srcElement;
  const stashTabId = stashButtonElement.dataset.id;
  if (!stashTabId) return;

  const selectedStashIds = settings.get('user.stashIds') || [];
  const selectedIndex = selectedStashIds.indexOf(stashTabId);

  if (selectedIndex > -1) {
    selectedStashIds.splice(selectedIndex, 1)
  } else {
    selectedStashIds.push(stashTabId);
  }

  stashButtonElement.classList.toggle('btn-primary');
  stashButtonElement.classList.toggle('btn-success');
  settings.set('user.stashIds', selectedStashIds);
};

const leagueSelectElement = document.getElementById('league-select');
fetchActiveLeagues().then((activeLeagues) => {
  activeLeagues.forEach((league) => {
    const leagueOption = document.createElement('option');
    leagueOption.value = league;
    leagueOption.text = league;

    leagueSelectElement.add(leagueOption);
  });

  leagueSelectElement.value = settings.get('user.league');
});

leagueSelectElement.onchange = async ({srcElement: {value}}) => {
  settings.set('user.league', value);
  settings.set('user.stashIds', []);
  refreshStashTabs();
};

const accountInputElement = document.getElementById('account-input');
accountInputElement.value = settings.get('user.account') || '';
accountInputElement.oninput = async ({srcElement: {value}}) => {
  settings.set('user.account', value);
  refreshStashTabs();
};

const sessionIdInputElement = document.getElementById('session-id-input');
sessionIdInputElement.value = settings.get('user.sessionId') || '';
sessionIdInputElement.oninput = async ({srcElement: {value}}) => {
  settings.set('user.sessionId', value);
  refreshStashTabs();
};

const RefreshTimeInputElement = document.getElementById('refresh-time-input');
RefreshTimeInputElement.value = settings.get('overlay.refreshTime') || 30;
RefreshTimeInputElement.oninput = async ({srcElement: {value}}) => {
  settings.set('overlay.refreshTime', value);
};

const OverlaySizeSelectElement = document.getElementById('overlay-size-select');
OverlaySizeSelectElement.value = settings.get('overlay.size') || 1;
OverlaySizeSelectElement.onchange = async ({srcElement: {value}}) => {
  settings.set('overlay.size', value);
  ipcRenderer.send('overlay-size-changed');
}

refreshStashTabs();
