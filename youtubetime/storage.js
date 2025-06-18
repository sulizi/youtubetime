import { getRedundantSetting, setRedundantSetting } from './redundantStorage.js';

/**
 * Get the box color setting.
 * @returns {Promise<string>} The box color as a hex string.
 */
export async function getBoxColor() {
  return await getRedundantSetting('ytAdjustedTimeBoxColor', '#ffa500');
}
/**
 * Set the box color setting.
 * @param {string} val - The color value to set.
 */
export async function setBoxColor(val) {
  await setRedundantSetting('ytAdjustedTimeBoxColor', val);
}

/**
 * Get whether the box color is enabled.
 * @returns {Promise<boolean>} True if enabled, false otherwise.
 */
export async function getBoxColorEnabled() {
  return await getRedundantSetting('ytAdjustedTimeBoxColorEnabled', true);
}
/**
 * Set whether the box color is enabled.
 * @param {boolean} val - True to enable, false to disable.
 */
export async function setBoxColorEnabled(val) {
  await setRedundantSetting('ytAdjustedTimeBoxColorEnabled', val);
}

/**
 * Get the current theme.
 * @returns {Promise<string>} The theme name.
 */
export async function getTheme() {
  return await getRedundantSetting('ytAdjustedTimeTheme', 'Classic');
}
/**
 * Set the current theme.
 * @param {string} val - The theme name to set.
 */
export async function setTheme(val) {
  await setRedundantSetting('ytAdjustedTimeTheme', val);
}

/**
 * Get the text color setting.
 * @returns {Promise<string>} The text color as a hex string.
 */
export async function getTextColor() {
  return await getRedundantSetting('ytAdjustedTimeTextColor', '#fff');
}
/**
 * Set the text color setting.
 * @param {string} val - The color value to set.
 */
export async function setTextColor(val) {
  await setRedundantSetting('ytAdjustedTimeTextColor', val);
}

/**
 * Get whether to show end time.
 * @returns {Promise<boolean>} True if enabled, false otherwise.
 */
export async function getShowEndTime() {
  return await getRedundantSetting('ytAdjustedTimeShowEndTime', true);
}
/**
 * Set whether to show end time.
 * @param {boolean} val - True to enable, false to disable.
 */
export async function setShowEndTime(val) {
  await setRedundantSetting('ytAdjustedTimeShowEndTime', val);
}

/**
 * Get whether to use 24-hour time.
 * @returns {Promise<boolean>} True if 24-hour time, false otherwise.
 */
export async function get24HourTime() {
  return await getRedundantSetting('ytAdjustedTime24Hour', false);
}
/**
 * Set whether to use 24-hour time.
 * @param {boolean} val - True for 24-hour, false for 12-hour.
 */
export async function set24HourTime(val) {
  await setRedundantSetting('ytAdjustedTime24Hour', val);
}

/**
 * Get the box opacity setting.
 * @returns {Promise<number>} The opacity as a percentage (0-100).
 */
export async function getBoxOpacity() {
  return await getRedundantSetting('ytAdjustedTimeBoxOpacity', 100);
}
/**
 * Set the box opacity setting.
 * @param {number} val - The opacity value to set (0-100).
 */
export async function setBoxOpacity(val) {
  await setRedundantSetting('ytAdjustedTimeBoxOpacity', val);
}

/**
 * Get the global time saved value.
 * @returns {Promise<number>} The total time saved in seconds.
 */
export async function getGlobalTimeSaved() {
  let syncVal, localVal, lsVal;
  // SYNC
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
    const result = await browser.storage.sync.get('ytAdjustedTimeGlobalSaved');
    syncVal = result.ytAdjustedTimeGlobalSaved;
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    syncVal = await new Promise(resolve => {
      chrome.storage.sync.get('ytAdjustedTimeGlobalSaved', result => {
        resolve(result.ytAdjustedTimeGlobalSaved);
      });
    });
  }
  // LOCAL
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    const result = await browser.storage.local.get('ytAdjustedTimeGlobalSaved');
    localVal = result.ytAdjustedTimeGlobalSaved;
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    localVal = await new Promise(resolve => {
      chrome.storage.local.get('ytAdjustedTimeGlobalSaved', result => {
        resolve(result.ytAdjustedTimeGlobalSaved);
      });
    });
  }
  // LOCALSTORAGE
  lsVal = parseFloat(localStorage.getItem('ytAdjustedTimeGlobalSaved') || '0');
  // Pick the max (most up-to-date)
  let best = Math.max(syncVal || 0, localVal || 0, lsVal || 0);
  // Restore if missing
  if (syncVal !== best) setGlobalTimeSaved(best, 'sync');
  if (localVal !== best) setGlobalTimeSaved(best, 'local');
  if (lsVal !== best) setGlobalTimeSaved(best, 'localStorage');
  return best;
}
/**
 * Set the global time saved value.
 * @param {number} val - The value to set (seconds).
 * @param {string} [only] - Optional: 'sync', 'local', or 'localStorage' to restrict where to set.
 */
export async function setGlobalTimeSaved(val, only) {
  if (!only || only === 'sync') {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
      await browser.storage.sync.set({ ytAdjustedTimeGlobalSaved: val });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ ytAdjustedTimeGlobalSaved: val });
    }
  }
  if (!only || only === 'local') {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      await browser.storage.local.set({ ytAdjustedTimeGlobalSaved: val });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ ytAdjustedTimeGlobalSaved: val });
    }
  }
  if (!only || only === 'localStorage') {
    localStorage.setItem('ytAdjustedTimeGlobalSaved', val.toString());
  }
}

/**
 * Get the watch stats array.
 * @returns {Promise<Array>} Array of watch session objects.
 */
export async function getWatchStats() {
  let localVal, lsVal;
  // LOCAL
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    const result = await browser.storage.local.get('ytWatchStats');
    localVal = result.ytWatchStats;
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    localVal = await new Promise(resolve => {
      chrome.storage.local.get('ytWatchStats', result => {
        resolve(result.ytWatchStats);
      });
    });
  }
  // LOCALSTORAGE
  try {
    lsVal = JSON.parse(localStorage.getItem('ytWatchStats') || '[]');
  } catch (e) {
    lsVal = [];
  }
  // Pick the longer (most up-to-date)
  let best = (localVal && localVal.length > (lsVal ? lsVal.length : 0)) ? localVal : lsVal;
  // Restore if missing
  if (JSON.stringify(localVal) !== JSON.stringify(best)) setWatchStats(best, 'local');
  if (JSON.stringify(lsVal) !== JSON.stringify(best)) setWatchStats(best, 'localStorage');
  return best || [];
}
/**
 * Set the watch stats array.
 * @param {Array} val - Array of watch session objects.
 * @param {string} [only] - Optional: 'local' or 'localStorage' to restrict where to set.
 */
export async function setWatchStats(val, only) {
  if (!only || only === 'local') {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      await browser.storage.local.set({ ytWatchStats: val });
    } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ ytWatchStats: val });
    }
  }
  if (!only || only === 'localStorage') {
    localStorage.setItem('ytWatchStats', JSON.stringify(val));
  }
} 