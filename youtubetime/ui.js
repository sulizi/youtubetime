import {
  getTheme, setTheme,
  getBoxColor, setBoxColor,
  getBoxColorEnabled, setBoxColorEnabled,
  getTextColor, setTextColor,
  getShowEndTime, setShowEndTime,
  get24HourTime, set24HourTime,
  getBoxOpacity, setBoxOpacity,
  getGlobalTimeSaved, setGlobalTimeSaved,
  getWatchStats, setWatchStats
} from './storage.js';
import {
  formatTime, formatEndTime, formatLongDuration, formatGlobalTimeSaved, aggregateStats, formatDuration
} from './stats.js';

// --- THEME PRESETS ---
export const YT_ADJUSTED_TIME_THEMES = [
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

/**
 * Update the preview box in the options UI to reflect current settings.
 */
export function updatePreview() {
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

/**
 * Attach the same event handler to multiple elements/events.
 * @param {Array} configs - Array of {id, event, handler}
 */
function attachListeners(configs) {
  configs.forEach(({id, event, handler}) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  });
}

/**
 * Initialize the options UI: populate controls, load settings, and set up event listeners.
 * @returns {Promise<void>} Resolves when UI setup is complete.
 */
export async function setupUI() {
  try {
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

    // DRY event listeners
    attachListeners([
      {id: 'color', event: 'input', handler: updatePreview},
      {id: 'color-enabled', event: 'change', handler: updatePreview},
      {id: 'text-color', event: 'input', handler: updatePreview},
      {id: 'show-endtime', event: 'change', handler: updatePreview},
      {id: '24hour', event: 'change', handler: updatePreview},
      {id: 'box-opacity', event: 'input', handler: updatePreview},
      {id: 'box-opacity', event: 'change', handler: updatePreview},
    ]);

    // Event listeners
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

    // Apply button
    document.getElementById('apply-btn').addEventListener('click', async function(e) {
      e.preventDefault();
      try {
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
      } catch (err) {
        alert('Failed to save settings: ' + (err && err.message ? err.message : err));
      }
    });

    // Back to YouTube
    document.getElementById('back-to-youtube').addEventListener('click', function() {
      window.close();
    });
  } catch (err) {
    alert('Failed to load settings: ' + (err && err.message ? err.message : err));
  }
}

/**
 * Render the statistics table in the options UI.
 * @param {Object} stats - Aggregated stats object from aggregateStats().
 */
export function renderStats(stats) {
  const c = document.getElementById('yt-stats-container');
  // The following assignment is safe because all data is generated by our code, not user input.
  // If user input is ever included, sanitize it before assignment.
  c.innerHTML = `
    <table style="width:100%;max-width:500px">
      <tr><td><b>Total Watch Time</b></td><td>${formatDuration(stats.total)}</td></tr>
      <tr><td>Today</td><td>${formatDuration(stats.totalDay)}</td></tr>
      <tr><td>This Week</td><td>${formatDuration(stats.totalWeek)}</td></tr>
      <tr><td>This Month</td><td>${formatDuration(stats.totalMonth)}</td></tr>
      <tr><td><b>Average Session</b></td><td>${formatDuration(stats.avgSession)}</td></tr>
      <tr><td><b>Peak Usage Hour</b></td><td>${stats.peakHour !== null ? stats.peakHour + ':00' : '-'}</td></tr>
      <tr><td><b>Top Channels</b></td><td>${stats.topChannels.map(([n,t])=>`${n.replace(/</g,'&lt;').replace(/>/g,'&gt;')} (${formatDuration(t)})`).join('<br>') || '-'}</td></tr>
      <tr><td><b>Top Videos</b></td><td>${stats.topVideos.map(([n,t])=>`${n.replace(/</g,'&lt;').replace(/>/g,'&gt;')} (${formatDuration(t)})`).join('<br>') || '-'}</td></tr>
    </table>
  `;
}

/**
 * Load stats from storage, aggregate, and render them in the UI.
 * @returns {Promise<void>} Resolves when stats are loaded and rendered.
 */
export async function loadStats() {
  try {
    const statsArr = await getWatchStats();
    const stats = aggregateStats(statsArr || []);
    renderStats(stats);
  } catch (err) {
    const c = document.getElementById('yt-stats-container');
    if (c) c.innerHTML = '<span style="color:red">Failed to load statistics.</span>';
  }
} 