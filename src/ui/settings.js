// Vendor
const {ipcRenderer} = require('electron');
const settings = require('electron-settings');

// Services
const {fetchStashTabs} = require('../services/stash-tabs');

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

const overlayWidthInputElement = document.getElementById('overlay-width-input');
overlayWidthInputElement.value = settings.get('overlayWidth');
overlayWidthInputElement.oninput = ({srcElement: {value}}) => {
  ipcRenderer.send('resizeOverlay', {width: parseInt(value, 10)});
};

const leagueInputElement = document.getElementById('league-input');
leagueInputElement.value = settings.get('user.league') || '';
leagueInputElement.oninput = async ({srcElement: {value}}) => {
  settings.set('user.league', value);
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

refreshStashTabs();
