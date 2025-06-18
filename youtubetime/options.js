// options.js

import { getRedundantSetting, setRedundantSetting } from './redundantStorage.js';

// Load and save color using storage.sync
const colorInput = document.getElementById('color');
const preview = document.getElementById('preview');
const colorEnabledInput = document.getElementById('color-enabled');

// --- THEME PRESETS ---
const YT_ADJUSTED_TIME_THEMES = [
  { name: 'Classic', bg: '#ffa500', text: '#ffffff' },
  { name: 'Dark', bg: '#222222', text: '#ffffff' },
  { name: 'Light', bg: '#ffffff', text: '#222222' },
  { name: 'YouTube Red', bg: '#ff0000', text: '#ffffff' },
  { name: 'Ocean', bg: '#0077be', text: '#ffffff' },
  { name: 'High Contrast', bg: '#000000', text: '#ffff00' },
  { name: 'Transparent', bg: 'transparent', text: '#ffa500' },
  { name: 'Solarized Dark', bg: '#073642', text: '#eee8d5' },
  { name: 'Solarized Light', bg: '#fdf6e3', text: '#657b83' },
  { name: 'Custom', bg: null, text: null }
];

async function getBoxColor() {
  return await getRedundantSetting('ytAdjustedTimeBoxColor', '#ffa500');
}
async function setBoxColor(val) {
  await setRedundantSetting('ytAdjustedTimeBoxColor', val);
}

async function getBoxColorEnabled() {
  return await getRedundantSetting('ytAdjustedTimeBoxColorEnabled', true);
}
async function setBoxColorEnabled(val) {
  await setRedundantSetting('ytAdjustedTimeBoxColorEnabled', val);
}

async function getTheme() {
  return await getRedundantSetting('ytAdjustedTimeTheme', 'Classic');
}
async function setTheme(val) {
  await setRedundantSetting('ytAdjustedTimeTheme', val);
}

async function getTextColor() {
  return await getRedundantSetting('ytAdjustedTimeTextColor', '#fff');
}
async function setTextColor(val) {
  await setRedundantSetting('ytAdjustedTimeTextColor', val);
}

async function getShowEndTime() {
  return await getRedundantSetting('ytAdjustedTimeShowEndTime', true);
}
async function setShowEndTime(val) {
  await setRedundantSetting('ytAdjustedTimeShowEndTime', val);
}

async function get24HourTime() {
  return await getRedundantSetting('ytAdjustedTime24Hour', false);
}
async function set24HourTime(val) {
  await setRedundantSetting('ytAdjustedTime24Hour', val);
}

function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
function formatEndTime(secondsFromNow, use24Hour) {
  const end = new Date(Date.now() + secondsFromNow * 1000);
  let hours = end.getHours();
  const minutes = end.getMinutes().toString().padStart(2, '0');
  if (use24Hour) {
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  } else {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    let h12 = hours % 12;
    if (h12 === 0) h12 = 12;
    return `${h12}:${minutes} ${ampm}`;
  }
}
function updatePreview() {
  const theme = document.getElementById('theme').value;
  const color = document.getElementById('color').value;
  const colorEnabled = document.getElementById('color-enabled').checked;
  const textColor = document.getElementById('text-color').value;
  const showEndTime = document.getElementById('show-endtime').checked;
  const use24Hour = document.getElementById('24hour').checked;
  const boxOpacity = document.getElementById('box-opacity').value;
  let bg = colorEnabled ? color : 'transparent';
  let fg = textColor;
  if (theme !== 'Custom') {
    const preset = YT_ADJUSTED_TIME_THEMES.find(t => t.name === theme);
    if (preset) {
      bg = colorEnabled ? preset.bg : 'transparent';
      fg = preset.text;
    }
  }
  const preview = document.getElementById('preview');
  preview.style.background = bg;
  preview.style.color = fg;
  preview.style.border = bg !== 'transparent' ? '1px solid rgba(0,0,0,0.15)' : 'none';
  preview.style.fontFamily = "'YouTube Sans', 'Roboto', 'Arial', 'sans-serif'";
  preview.style.fontSize = '13px';
  preview.style.fontWeight = '400';
  preview.style.borderRadius = '2px';
  preview.style.padding = '0 4px';
  preview.style.verticalAlign = 'middle';
  preview.style.textShadow = 'none';
  preview.style.boxShadow = 'none';
  preview.style.opacity = (parseInt(boxOpacity, 10) / 100).toString();
  const adjusted = 542; // example seconds
  const endTime = formatEndTime(adjusted, use24Hour);
  preview.textContent = showEndTime ? `${formatTime(adjusted)} | ${endTime}` : `${formatTime(adjusted)}`;
  document.getElementById('box-opacity-value').textContent = boxOpacity + '%';
}
// Initialize
(async () => {
  // Populate theme selector
  const themeSelect = document.getElementById('theme');
  for (const theme of YT_ADJUSTED_TIME_THEMES) {
    const opt = document.createElement('option');
    opt.value = theme.name;
    opt.textContent = theme.name;
    themeSelect.appendChild(opt);
  }
  // Load settings
  const [theme, color, colorEnabled, textColor, showEndTime, use24Hour, boxOpacity] = await Promise.all([
    getTheme(), getBoxColor(), getBoxColorEnabled(), getTextColor(), getShowEndTime(), get24HourTime(), getBoxOpacity()
  ]);
  themeSelect.value = theme;
  document.getElementById('color').value = color;
  document.getElementById('color-enabled').checked = colorEnabled;
  document.getElementById('text-color').value = textColor;
  document.getElementById('show-endtime').checked = showEndTime;
  document.getElementById('24hour').checked = use24Hour;
  document.getElementById('box-opacity').value = boxOpacity;
  document.getElementById('box-opacity-value').textContent = boxOpacity + '%';
  // Disable color pickers if not custom
  if (theme !== 'Custom') {
    const preset = YT_ADJUSTED_TIME_THEMES.find(t => t.name === theme);
    if (preset) {
      document.getElementById('color').value = preset.bg;
      document.getElementById('text-color').value = preset.text;
      document.getElementById('color').disabled = true;
      document.getElementById('text-color').disabled = true;
    }
  }
  updatePreview();
})();
document.getElementById('theme').addEventListener('change', function() {
  if (this.value !== 'Custom') {
    const preset = YT_ADJUSTED_TIME_THEMES.find(t => t.name === this.value);
    if (preset) {
      document.getElementById('color').value = preset.bg;
      document.getElementById('text-color').value = preset.text;
      document.getElementById('color').disabled = true;
      document.getElementById('text-color').disabled = true;
    }
  } else {
    document.getElementById('color').disabled = false;
    document.getElementById('text-color').disabled = false;
  }
  updatePreview();
});
document.getElementById('color').addEventListener('input', updatePreview);
document.getElementById('color-enabled').addEventListener('change', updatePreview);
document.getElementById('text-color').addEventListener('input', updatePreview);
document.getElementById('show-endtime').addEventListener('change', updatePreview);
document.getElementById('24hour').addEventListener('change', updatePreview);
document.getElementById('box-opacity').addEventListener('input', updatePreview);
document.getElementById('box-opacity').addEventListener('change', async function() {
  await setBoxOpacity(this.value);
  updatePreview();
});
document.getElementById('apply-btn').addEventListener('click', async function(e) {
  e.preventDefault();
  const theme = document.getElementById('theme').value;
  const color = document.getElementById('color').value;
  const colorEnabled = document.getElementById('color-enabled').checked;
  const textColor = document.getElementById('text-color').value;
  const showEndTime = document.getElementById('show-endtime').checked;
  const use24Hour = document.getElementById('24hour').checked;
  const boxOpacity = document.getElementById('box-opacity').value;
  await setTheme(theme);
  await setBoxColor(color);
  await setBoxColorEnabled(colorEnabled);
  await setTextColor(textColor);
  await setShowEndTime(showEndTime);
  await set24HourTime(use24Hour);
  await setBoxOpacity(boxOpacity);
  document.getElementById('applied-msg').style.display = 'inline';
  setTimeout(() => {
    document.getElementById('applied-msg').style.display = 'none';
  }, 1200);
});

// --- GLOBAL TIME SAVED: REDUNDANT STORAGE ---
async function getGlobalTimeSaved() {
  // Try sync, then local, then localStorage
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
async function setGlobalTimeSaved(val, only) {
  // only: 'sync', 'local', 'localStorage' or undefined (all)
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
function formatLongDuration(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;
  let out = [];
  const years = Math.floor(seconds / YEAR);
  if (years > 0) out.push(years + 'y');
  seconds -= years * YEAR;
  const months = Math.floor(seconds / MONTH);
  if (months > 0) out.push(months + 'mo');
  seconds -= months * MONTH;
  const days = Math.floor(seconds / DAY);
  if (days > 0) out.push(days + 'd');
  seconds -= days * DAY;
  const hours = Math.floor(seconds / HOUR);
  if (hours > 0) out.push(hours + 'h');
  seconds -= hours * HOUR;
  const minutes = Math.floor(seconds / MINUTE);
  if (minutes > 0 || out.length === 0) out.push(minutes + 'm');
  return out.join(' ');
}
function formatGlobalTimeSaved(seconds) {
  return formatLongDuration(seconds);
}
// Add display to options page
document.addEventListener('DOMContentLoaded', async function() {
  await setupUI();
  if (document.getElementById('yt-stats-container')) {
    await loadStats();
  }
  if (document.getElementById('yt-analytics-container')) {
    renderAnalyticsCharts();
  }
  let statDiv = document.createElement('div');
  statDiv.className = 'section';
  // Instead of innerHTML, use DOM methods
  const strong = document.createElement('strong');
  strong.textContent = 'Total time saved:';
  const span = document.createElement('span');
  span.id = 'yt-global-time-saved';
  span.textContent = '...';
  const button = document.createElement('button');
  button.id = 'yt-reset-global-time-saved';
  button.style.marginLeft = '1em';
  button.textContent = 'Reset';
  statDiv.appendChild(strong);
  statDiv.appendChild(document.createTextNode(' '));
  statDiv.appendChild(span);
  statDiv.appendChild(button);
  document.body.insertBefore(statDiv, document.body.firstChild.nextSibling);
  async function updateStat() {
    const total = await getGlobalTimeSaved();
    document.getElementById('yt-global-time-saved').textContent = formatGlobalTimeSaved(total);
  }
  updateStat();
  document.getElementById('yt-reset-global-time-saved').onclick = async function() {
    await setGlobalTimeSaved(0);
    updateStat();
  };
});

document.getElementById('back-to-youtube').addEventListener('click', function() {
  window.close();
});

// Add get/set for opacity
async function getBoxOpacity() {
  return await getRedundantSetting('ytAdjustedTimeBoxOpacity', 100);
}
async function setBoxOpacity(val) {
  await setRedundantSetting('ytAdjustedTimeBoxOpacity', val);
}

// --- WATCH STATS: REDUNDANT STORAGE ---
async function getWatchStats() {
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
async function setWatchStats(val, only) {
  // only: 'local', 'localStorage' or undefined (both)
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

// --- EXPORT/IMPORT UI ---
function addExportImportUI() {
  // Global time saved
  const statDiv = document.querySelector('.section');
  if (statDiv) {
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Stats';
    exportBtn.style.marginLeft = '1em';
    exportBtn.onclick = async function() {
      const global = await getGlobalTimeSaved();
      const watch = await getWatchStats();
      const blob = new Blob([JSON.stringify({ global, watch }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'yt-stats-backup.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    statDiv.appendChild(exportBtn);
    // Import
    const importBtn = document.createElement('button');
    importBtn.textContent = 'Import Stats';
    importBtn.style.marginLeft = '1em';
    importBtn.onclick = function() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          if (typeof data.global === 'number') await setGlobalTimeSaved(data.global);
          if (Array.isArray(data.watch)) await setWatchStats(data.watch);
          alert('Stats imported!');
          location.reload();
        } catch (e) {
          alert('Invalid stats file.');
        }
      };
      input.click();
    };
    statDiv.appendChild(importBtn);
  }
}
document.addEventListener('DOMContentLoaded', addExportImportUI);

// --- PATCH: RESET BUTTONS ---
document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  document.getElementById('yt-reset-global-time-saved').onclick = async function() {
    await setGlobalTimeSaved(0);
    document.getElementById('yt-global-time-saved').textContent = formatGlobalTimeSaved(0);
  };
  // Patch for watch stats reset
  if (document.getElementById('reset-stats-btn')) {
    document.getElementById('reset-stats-btn').addEventListener('click', async function() {
      if (confirm('Are you sure you want to reset all watch statistics?')) {
        await setWatchStats([]);
        loadStats();
      }
    });
  }
});

// --- PATCH: LOAD STATS USES REDUNDANT GET ---
function loadStats() {
  getWatchStats().then(statsArr => {
    const stats = aggregateStats(statsArr || []);
    renderStats(stats);
  });
}

// --- BEGIN: YouTube Watch Statistics Section ---
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getDayKey(ts) {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getHour(ts) {
  return new Date(ts).getHours();
}

function aggregateStats(sessions) {
  const now = Date.now();
  const oneDay = 24 * 3600 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;
  let total = 0, totalDay = 0, totalWeek = 0, totalMonth = 0;
  let sessionLengths = [];
  let channelMap = {}, videoMap = {}, hourMap = {};
  const todayKey = getDayKey(now);
  sessions.forEach(s => {
    const dur = Math.floor((s.endTime - s.startTime) / 1000);
    if (dur < 5) return;
    total += dur;
    sessionLengths.push(dur);
    if (now - s.startTime < oneDay) totalDay += dur;
    if (now - s.startTime < oneWeek) totalWeek += dur;
    if (now - s.startTime < oneMonth) totalMonth += dur;
    // Channel
    if (s.channel) channelMap[s.channel] = (channelMap[s.channel] || 0) + dur;
    // Video
    if (s.title) videoMap[s.title] = (videoMap[s.title] || 0) + dur;
    // Hour
    const hour = getHour(s.startTime);
    hourMap[hour] = (hourMap[hour] || 0) + dur;
  });
  // Most-watched
  const topChannels = Object.entries(channelMap).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const topVideos = Object.entries(videoMap).sort((a,b)=>b[1]-a[1]).slice(0,3);
  // Peak hour
  let peakHour = null, peakVal = 0;
  for (const [h, v] of Object.entries(hourMap)) {
    if (v > peakVal) { peakVal = v; peakHour = h; }
  }
  // Average session
  const avgSession = sessionLengths.length ? Math.round(sessionLengths.reduce((a,b)=>a+b,0)/sessionLengths.length) : 0;
  return {
    total, totalDay, totalWeek, totalMonth,
    topChannels, topVideos,
    avgSession, peakHour
  };
}

function renderStats(stats) {
  const c = document.getElementById('yt-stats-container');
  c.innerHTML = `
    <table style="width:100%;max-width:500px">
      <tr><td><b>Total Watch Time</b></td><td>${formatDuration(stats.total)}</td></tr>
      <tr><td>Today</td><td>${formatDuration(stats.totalDay)}</td></tr>
      <tr><td>This Week</td><td>${formatDuration(stats.totalWeek)}</td></tr>
      <tr><td>This Month</td><td>${formatDuration(stats.totalMonth)}</td></tr>
      <tr><td><b>Average Session</b></td><td>${formatDuration(stats.avgSession)}</td></tr>
      <tr><td><b>Peak Usage Hour</b></td><td>${stats.peakHour !== null ? stats.peakHour + ':00' : '-'}</td></tr>
      <tr><td><b>Top Channels</b></td><td>${stats.topChannels.map(([n,t])=>`${n} (${formatDuration(t)})`).join('<br>') || '-'}</td></tr>
      <tr><td><b>Top Videos</b></td><td>${stats.topVideos.map(([n,t])=>`${n} (${formatDuration(t)})`).join('<br>') || '-'}</td></tr>
    </table>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('yt-stats-container')) {
    loadStats();
  }
});
// --- END: YouTube Watch Statistics Section ---

document.getElementById('clear-all-data-btn').addEventListener('click', async function() {
  if (confirm('Are you sure you want to clear all extension data? This cannot be undone.')) {
    await setGlobalTimeSaved(0);
    await setWatchStats([]);
    // Reset all settings to defaults
    await setTheme('Classic');
    await setBoxColor('#ffa500');
    await setBoxColorEnabled(true);
    await setTextColor('#fff');
    await setShowEndTime(true);
    await set24HourTime(false);
    await setBoxOpacity(100);
    localStorage.clear();
    alert('All extension data cleared.');
    location.reload();
  }
});

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Debounced setBoxOpacity
const debouncedSetBoxOpacity = debounce(async function(val) {
  await setBoxOpacity(val);
}, 200);

// Update event listeners for box opacity
const boxOpacityInput = document.getElementById('box-opacity');
boxOpacityInput.addEventListener('input', function() {
  debouncedSetBoxOpacity(this.value);
  updatePreview();
});
boxOpacityInput.addEventListener('change', function() {
  debouncedSetBoxOpacity(this.value);
  updatePreview();
});

// --- CHARTS & ANALYTICS PLACEHOLDER ---
function renderAnalyticsCharts() {
  // Placeholder for future chart/analytics integration
  // Example: Use Chart.js or similar library to render watch time trends
  // This function will be called when analytics UI is shown
  const container = document.getElementById('yt-analytics-container');
  if (!container) return;
  container.innerHTML = '<em>Charts and analytics coming soon...</em>';
}

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('yt-analytics-container')) {
    renderAnalyticsCharts();
  }
});

document.addEventListener('DOMContentLoaded', async function() {
  await setupUI();
  if (document.getElementById('yt-stats-container')) {
    await loadStats();
  }
  if (document.getElementById('yt-analytics-container')) {
    renderAnalyticsCharts();
  }
}); 