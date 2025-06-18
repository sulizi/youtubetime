// redundantStorage.js
// Utility for robust, redundant persistent storage of settings

export async function getRedundantSetting(key, defaultValue) {
  let syncVal, localVal, lsVal;
  // SYNC
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
    const result = await browser.storage.sync.get(key);
    syncVal = result[key];
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    syncVal = await new Promise(resolve => {
      chrome.storage.sync.get(key, result => {
        resolve(result[key]);
      });
    });
  }
  // LOCAL
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    const result = await browser.storage.local.get(key);
    localVal = result[key];
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    localVal = await new Promise(resolve => {
      chrome.storage.local.get(key, result => {
        resolve(result[key]);
      });
    });
  }
  // LOCALSTORAGE
  lsVal = localStorage.getItem(key);
  // Try to parse booleans and numbers
  if (lsVal === 'true') lsVal = true;
  else if (lsVal === 'false') lsVal = false;
  else if (lsVal !== null && !isNaN(lsVal) && lsVal.trim() !== '') lsVal = Number(lsVal);
  // Pick the first non-undefined value, or default
  let best = syncVal;
  if (typeof best === 'undefined') best = localVal;
  if (typeof best === 'undefined') best = lsVal;
  if (typeof best === 'undefined' || best === null) best = defaultValue;
  // Restore if missing
  if (syncVal !== best) setRedundantSetting(key, best, 'sync');
  if (localVal !== best) setRedundantSetting(key, best, 'local');
  if (lsVal !== best) setRedundantSetting(key, best, 'localStorage');
  return best;
}

export async function setRedundantSetting(key, value, only) {
  if (!only || only === 'sync') {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
      await browser.storage.sync.set({ [key]: value });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ [key]: value });
    }
  }
  if (!only || only === 'local') {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      await browser.storage.local.set({ [key]: value });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: value });
    }
  }
  if (!only || only === 'localStorage') {
    localStorage.setItem(key, typeof value === 'boolean' || typeof value === 'number' ? value.toString() : value);
  }
} 