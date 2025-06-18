(function () {
  'use strict';

  // redundantStorage.js
  // Utility for robust, redundant persistent storage of settings

  async function getRedundantSetting(key, defaultValue) {
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

  async function setRedundantSetting(key, value, only) {
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

  console.log('[YT Adjusted Time] Content script loaded');

  let ytAdjustedTimeCollapsed = getCollapsedState();
  let lastUpdate = 0;
  function throttledUpdateAdjustedTime() {
      const now = Date.now();
      if (now - lastUpdate > 500) {
          lastUpdate = now;
          updateAdjustedTime();
      }
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

  function getCollapsedState() {
      return localStorage.getItem('ytAdjustedTimeCollapsed') === 'true';
  }
  function setCollapsedState(val) {
      localStorage.setItem('ytAdjustedTimeCollapsed', val ? 'true' : 'false');
  }
  async function getBoxColorEnabled() {
      return await getRedundantSetting('ytAdjustedTimeBoxColorEnabled', true);
  }
  async function setBoxColorEnabled(val) {
      await setRedundantSetting('ytAdjustedTimeBoxColorEnabled', val);
  }
  async function getBoxColor() {
      return await getRedundantSetting('ytAdjustedTimeBoxColor', '#ffa500');
  }
  async function setBoxColor(val) {
      await setRedundantSetting('ytAdjustedTimeBoxColor', val);
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
  async function getGlobalTimeSaved() {
      return await getRedundantSetting('ytAdjustedTimeGlobalSaved', 0);
  }

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
  async function getTheme() {
      return await getRedundantSetting('ytAdjustedTimeTheme', 'Classic');
  }
  async function setTheme(val) {
      await setRedundantSetting('ytAdjustedTimeTheme', val);
  }

  // --- 24-HOUR TIME SETTING ---
  async function get24HourTime() {
      return await getRedundantSetting('ytAdjustedTime24Hour', false);
  }
  async function set24HourTime(val) {
      await setRedundantSetting('ytAdjustedTime24Hour', val);
  }

  // Add getBoxOpacity for content.js
  async function getBoxOpacity() {
      let opacity = 100;
      if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
          const result = await browser.storage.sync.get('ytAdjustedTimeBoxOpacity');
          opacity = result.ytAdjustedTimeBoxOpacity !== undefined ? result.ytAdjustedTimeBoxOpacity : 100;
      } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          opacity = await new Promise(resolve => {
              chrome.storage.sync.get('ytAdjustedTimeBoxOpacity', result => {
                  resolve(result.ytAdjustedTimeBoxOpacity !== undefined ? result.ytAdjustedTimeBoxOpacity : 100);
              });
          });
      } else {
          const val = localStorage.getItem('ytAdjustedTimeBoxOpacity');
          opacity = val === null ? 100 : parseInt(val, 10);
      }
      return opacity;
  }

  // Add this utility to format seconds as years, months, days, hours, and minutes
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

  function createSettingsPopup(parent, boxColor, textColor, showEndTime, sessionSaved, globalSaved) {
      let popup = document.createElement('div');
      popup.id = 'yt-adjusted-time-popup';
      popup.style.position = 'absolute';
      popup.style.zIndex = '99999';
      popup.style.background = '#222';
      popup.style.color = '#fff';
      popup.style.border = '1px solid #444';
      popup.style.borderRadius = '6px';
      popup.style.padding = '12px 16px 12px 16px';
      popup.style.boxShadow = '0 2px 8px #000a';
      popup.style.top = '32px';
      popup.style.right = '0';
      popup.style.fontSize = '15px';
      popup.style.minWidth = '220px';
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-modal', 'true');

      // Opacity slider UI
      const opacityDiv = document.createElement('div');
      opacityDiv.style.marginBottom = '1em';
      opacityDiv.style.display = 'flex';
      opacityDiv.style.alignItems = 'center';
      const opacityLabel = document.createElement('label');
      opacityLabel.setAttribute('for', 'yt-adjusted-time-popup-opacity');
      opacityLabel.textContent = 'Opacity:';
      opacityLabel.style.marginRight = '0.5em';
      const opacityInput = document.createElement('input');
      opacityInput.type = 'range';
      opacityInput.id = 'yt-adjusted-time-popup-opacity';
      opacityInput.min = '0';
      opacityInput.max = '100';
      opacityInput.value = '100';
      opacityInput.style.verticalAlign = 'middle';
      opacityInput.style.marginRight = '0.5em';
      const opacityValue = document.createElement('span');
      opacityValue.id = 'yt-adjusted-time-popup-opacity-value';
      opacityValue.textContent = '100%';
      opacityDiv.appendChild(opacityLabel);
      opacityDiv.appendChild(opacityInput);
      opacityDiv.appendChild(opacityValue);
      popup.appendChild(opacityDiv);

      // Set opacity from storage and update slider
      getBoxOpacity().then(opacity => {
          popup.style.opacity = (parseInt(opacity, 10) / 100).toString();
          opacityInput.value = opacity;
          opacityValue.textContent = opacity + '%';
      });
      // Update opacity live and save
      opacityInput.addEventListener('input', function() {
          popup.style.opacity = (parseInt(this.value, 10) / 100).toString();
          opacityValue.textContent = this.value + '%';
      });
      opacityInput.addEventListener('change', function() {
          const val = this.value;
          if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
              browser.storage.sync.set({ ytAdjustedTimeBoxOpacity: val });
          } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
              chrome.storage.sync.set({ ytAdjustedTimeBoxOpacity: val });
          } else {
              localStorage.setItem('ytAdjustedTimeBoxOpacity', val.toString());
          }
      });

      // --- DRAGGABLE LOGIC ---
      // Remove drag handle, attach drag events to the popup itself
      let offsetX = 0, offsetY = 0, isDragging = false, startX = 0, startY = 0;
      const DRAG_KEY = 'ytAdjustedTimePopupPosition';

      // Restore position if available
      (async function restorePosition() {
          let pos = null;
          if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
              const result = await browser.storage.sync.get(DRAG_KEY);
              pos = result[DRAG_KEY];
          } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
              pos = await new Promise(resolve => {
                  chrome.storage.sync.get(DRAG_KEY, result => resolve(result[DRAG_KEY]));
              });
          } else {
              const raw = localStorage.getItem(DRAG_KEY);
              if (raw) pos = JSON.parse(raw);
          }
          if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
              popup.style.left = pos.x + 'px';
              popup.style.top = pos.y + 'px';
              popup.style.right = '';
          }
      })();

      function savePosition(x, y) {
          const pos = { x, y };
          if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
              browser.storage.sync.set({ [DRAG_KEY]: pos });
          } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
              chrome.storage.sync.set({ [DRAG_KEY]: pos });
          } else {
              localStorage.setItem(DRAG_KEY, JSON.stringify(pos));
          }
      }

      function isInteractiveElement(target) {
          return target.closest('input, button, select, textarea, label, option, [contenteditable]');
      }

      function onDragStart(e) {
          // Only start drag if not on an interactive element
          if (isInteractiveElement(e.target)) return;
          isDragging = true;
          const rect = popup.getBoundingClientRect();
          startX = (e.touches ? e.touches[0].clientX : e.clientX);
          startY = (e.touches ? e.touches[0].clientY : e.clientY);
          offsetX = startX - rect.left;
          offsetY = startY - rect.top;
          document.addEventListener('mousemove', onDragMove);
          document.addEventListener('mouseup', onDragEnd);
          document.addEventListener('touchmove', onDragMove, { passive: false });
          document.addEventListener('touchend', onDragEnd);
          e.preventDefault();
      }
      function onDragMove(e) {
          if (!isDragging) return;
          let clientX = e.touches ? e.touches[0].clientX : e.clientX;
          let clientY = e.touches ? e.touches[0].clientY : e.clientY;
          let x = clientX - offsetX;
          let y = clientY - offsetY;
          // Clamp to viewport
          x = Math.max(0, Math.min(window.innerWidth - popup.offsetWidth, x));
          y = Math.max(0, Math.min(window.innerHeight - popup.offsetHeight, y));
          popup.style.left = x + 'px';
          popup.style.top = y + 'px';
          popup.style.right = '';
          popup.style.bottom = '';
          e.preventDefault();
      }
      function onDragEnd(e) {
          if (!isDragging) return;
          isDragging = false;
          document.removeEventListener('mousemove', onDragMove);
          document.removeEventListener('mouseup', onDragEnd);
          document.removeEventListener('touchmove', onDragMove);
          document.removeEventListener('touchend', onDragEnd);
          // Save position
          const rect = popup.getBoundingClientRect();
          savePosition(rect.left, rect.top);
      }
      popup.addEventListener('mousedown', onDragStart);
      popup.addEventListener('touchstart', onDragStart, { passive: false });

      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '×';
      closeBtn.setAttribute('aria-label', 'Close settings popup');
      closeBtn.style.position = 'absolute';
      closeBtn.style.top = '6px';
      closeBtn.style.right = '8px';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = '#fff';
      closeBtn.style.fontSize = '20px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.lineHeight = '1';
      closeBtn.style.padding = '0';
      closeBtn.tabIndex = 0;
      closeBtn.onclick = function(e) {
          popup.remove();
          document.removeEventListener('mousedown', closePopup, { capture: true });
          e.stopPropagation();
      };
      closeBtn.onkeydown = function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
              popup.remove();
              document.removeEventListener('mousedown', closePopup, { capture: true });
              e.preventDefault();
          }
      };
      popup.appendChild(closeBtn);
      // Color controls
      const colorDiv = document.createElement('div');
      colorDiv.style.marginBottom = '1em';
      // BG color
      const label = document.createElement('label');
      label.setAttribute('for', 'yt-adjusted-time-popup-color');
      label.textContent = 'Box Color:';
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.id = 'yt-adjusted-time-popup-color';
      colorInput.value = boxColor;
      colorInput.setAttribute('aria-label', 'Box background color');
      colorDiv.appendChild(label);
      colorDiv.appendChild(colorInput);
      // Text color
      const textLabel = document.createElement('label');
      textLabel.setAttribute('for', 'yt-adjusted-time-popup-text-color');
      textLabel.textContent = ' Text Color:';
      textLabel.style.marginLeft = '1em';
      const textInput = document.createElement('input');
      textInput.type = 'color';
      textInput.id = 'yt-adjusted-time-popup-text-color';
      textInput.value = textColor;
      textInput.setAttribute('aria-label', 'Box text color');
      colorDiv.appendChild(textLabel);
      colorDiv.appendChild(textInput);
      // Enable/disable BG color
      const enabledLabel = document.createElement('label');
      enabledLabel.style.marginLeft = '1em';
      const enabledInput = document.createElement('input');
      enabledInput.type = 'checkbox';
      enabledInput.id = 'yt-adjusted-time-popup-color-enabled';
      enabledLabel.appendChild(enabledInput);
      enabledLabel.appendChild(document.createTextNode(' Colored background'));
      colorDiv.appendChild(enabledLabel);
      popup.appendChild(colorDiv);
      // Show/hide end time
      const endTimeDiv = document.createElement('div');
      endTimeDiv.style.marginBottom = '1em';
      const endTimeLabel = document.createElement('label');
      endTimeLabel.setAttribute('for', 'yt-adjusted-time-popup-show-endtime');
      endTimeLabel.textContent = 'Show End Time:';
      const endTimeInput = document.createElement('input');
      endTimeInput.type = 'checkbox';
      endTimeInput.id = 'yt-adjusted-time-popup-show-endtime';
      endTimeInput.checked = showEndTime;
      endTimeInput.setAttribute('aria-label', 'Show projected end time');
      endTimeDiv.appendChild(endTimeLabel);
      endTimeDiv.appendChild(endTimeInput);
      popup.appendChild(endTimeDiv);
      // Time saved stats
      const statsDiv = document.createElement('div');
      statsDiv.style.marginBottom = '1em';
      statsDiv.style.fontSize = '14px';
      const statsTitle = document.createElement('b');
      statsTitle.textContent = 'Time Saved:';
      statsDiv.appendChild(statsTitle);
      statsDiv.appendChild(document.createElement('br'));
      const sessionLabel = document.createElement('span');
      sessionLabel.textContent = 'Session: ';
      const sessionSpan = document.createElement('span');
      sessionSpan.id = 'yt-adjusted-time-session-saved';
      sessionSpan.textContent = formatTime(sessionSaved);
      statsDiv.appendChild(sessionLabel);
      statsDiv.appendChild(sessionSpan);
      statsDiv.appendChild(document.createElement('br'));
      const globalLabel = document.createElement('span');
      globalLabel.textContent = 'All-Time: ';
      const globalSpan = document.createElement('span');
      globalSpan.id = 'yt-adjusted-time-global-saved';
      globalSpan.textContent = formatLongDuration(globalSaved);
      statsDiv.appendChild(globalLabel);
      statsDiv.appendChild(globalSpan);
      popup.appendChild(statsDiv);
      const optionsBtn = document.createElement('button');
      optionsBtn.id = 'yt-adjusted-time-popup-options';
      optionsBtn.style.marginBottom = '1em';
      optionsBtn.style.width = '100%';
      optionsBtn.style.cursor = 'pointer';
      optionsBtn.textContent = 'Full Options Page';
      popup.appendChild(optionsBtn);
      const infoDiv = document.createElement('div');
      infoDiv.style.fontSize = '13px';
      infoDiv.style.color = '#aaa';
      infoDiv.textContent = 'Click outside to close';
      popup.appendChild(infoDiv);
      // Options page button
      optionsBtn.onclick = function(e) {
          e.stopPropagation();
          console.log('[YT Adjusted Time] Popup options button clicked');
          try {
              if ((typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) ||
                  (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage)) {
                  (browser?.runtime?.sendMessage || chrome?.runtime?.sendMessage)({ action: 'openOptions' });
              } else {
                  const url = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
                      ? chrome.runtime.getURL('options.html')
                      : 'options.html';
                  window.open(url, '_blank');
              }
          } catch (err) {
              console.error('[YT Adjusted Time] Exception in popup options button onclick:', err);
          }
      };
      // Close popup on outside click
      setTimeout(() => {
          document.addEventListener('mousedown', closePopup, { capture: true });
      }, 0);
      function closePopup(e) {
          if (!popup.contains(e.target) && e.target.id !== 'yt-adjusted-time-settings-btn') {
              popup.remove();
              document.removeEventListener('mousedown', closePopup, { capture: true });
          }
      }
      // Sync checkbox with storage
      getBoxColorEnabled().then(enabled => {
          enabledInput.checked = enabled;
          colorInput.disabled = !enabled;
      });
      enabledInput.addEventListener('change', async function() {
          await setBoxColorEnabled(this.checked);
          colorInput.disabled = !this.checked;
          updateAdjustedTime();
      });
      colorInput.addEventListener('input', async function(e) {
          await setBoxColor(this.value);
          updateAdjustedTime();
      });
      textInput.addEventListener('input', async function(e) {
          await setTextColor(this.value);
          updateAdjustedTime();
      });
      endTimeInput.addEventListener('change', async function(e) {
          await setShowEndTime(this.checked);
          updateAdjustedTime();
      });
      // Theme selector
      const themeDiv = document.createElement('div');
      themeDiv.style.marginBottom = '1em';
      const themeLabel = document.createElement('label');
      themeLabel.setAttribute('for', 'yt-adjusted-time-popup-theme');
      themeLabel.textContent = 'Theme:';
      const themeSelect = document.createElement('select');
      themeSelect.id = 'yt-adjusted-time-popup-theme';
      themeSelect.setAttribute('aria-label', 'Theme preset');
      for (const theme of YT_ADJUSTED_TIME_THEMES) {
          const opt = document.createElement('option');
          opt.value = theme.name;
          opt.textContent = theme.name;
          themeSelect.appendChild(opt);
      }
      themeDiv.appendChild(themeLabel);
      themeDiv.appendChild(themeSelect);
      popup.appendChild(themeDiv);
      // Set theme selector to current theme
      getTheme().then(currentTheme => {
          themeSelect.value = currentTheme;
          // If not custom, update color pickers and disable them
          if (currentTheme !== 'Custom') {
              const preset = YT_ADJUSTED_TIME_THEMES.find(t => t.name === currentTheme);
              if (preset) {
                  colorInput.value = preset.bg;
                  textInput.value = preset.text;
                  colorInput.disabled = true;
                  textInput.disabled = true;
              }
          } else {
              colorInput.disabled = false;
              textInput.disabled = false;
          }
      });
      themeSelect.addEventListener('change', async function() {
          await setTheme(this.value);
          if (this.value !== 'Custom') {
              const preset = YT_ADJUSTED_TIME_THEMES.find(t => t.name === this.value);
              if (preset) {
                  await setBoxColor(preset.bg);
                  await setTextColor(preset.text);
                  colorInput.value = preset.bg;
                  textInput.value = preset.text;
                  colorInput.disabled = true;
                  textInput.disabled = true;
              }
          } else {
              colorInput.disabled = false;
              textInput.disabled = false;
          }
          updateAdjustedTime();
      });
      // 24-hour time toggle
      const hourDiv = document.createElement('div');
      hourDiv.style.marginBottom = '1em';
      const hourLabel = document.createElement('label');
      hourLabel.setAttribute('for', 'yt-adjusted-time-popup-24hour');
      hourLabel.textContent = '24-hour time:';
      const hourInput = document.createElement('input');
      hourInput.type = 'checkbox';
      hourInput.id = 'yt-adjusted-time-popup-24hour';
      hourInput.setAttribute('aria-label', 'Use 24-hour time');
      hourDiv.appendChild(hourLabel);
      hourDiv.appendChild(hourInput);
      popup.appendChild(hourDiv);
      get24HourTime().then(val => { hourInput.checked = val; });
      hourInput.addEventListener('change', async function() {
          await set24HourTime(this.checked);
          updateAdjustedTime();
      });
      parent.appendChild(popup);
  }

  async function updateAdjustedTime() {
      const video = document.querySelector('video');
      let timeContents = document.querySelector('.ytp-time-contents');
      if (!timeContents) return;

      // Remove old expanded adjusted time if present (for collapse logic)
      let adjustedSpan = document.getElementById('yt-adjusted-time');
      if (ytAdjustedTimeCollapsed && adjustedSpan) adjustedSpan.remove();

      // Collapsed state: show clock icon
      if (ytAdjustedTimeCollapsed) {
          let collapsedBtn = document.getElementById('yt-adjusted-time-collapsed');
          if (!collapsedBtn) {
              collapsedBtn = document.createElement('span');
              collapsedBtn.id = 'yt-adjusted-time-collapsed';
              collapsedBtn.style.marginLeft = '6px';
              collapsedBtn.style.cursor = 'pointer';
              collapsedBtn.style.fontSize = '16px';
              collapsedBtn.style.verticalAlign = 'middle';
              collapsedBtn.textContent = '🕒';
              collapsedBtn.title = 'Show adjusted time left at current speed';
              collapsedBtn.setAttribute('tabindex', '0');
              collapsedBtn.setAttribute('role', 'button');
              collapsedBtn.setAttribute('aria-label', 'Show adjusted time left at current speed');
              collapsedBtn.onclick = function(e) {
                  ytAdjustedTimeCollapsed = false;
                  setCollapsedState(false);
                  // Remove the clock icon before expanding
                  let btn = document.getElementById('yt-adjusted-time-collapsed');
                  if (btn) btn.remove();
                  updateAdjustedTime();
                  e.stopPropagation();
              };
              collapsedBtn.onkeydown = function(e) {
                  if (e.key === 'Enter' || e.key === ' ') {
                      ytAdjustedTimeCollapsed = false;
                      setCollapsedState(false);
                      // Remove the clock icon before expanding
                      let btn = document.getElementById('yt-adjusted-time-collapsed');
                      if (btn) btn.remove();
                      updateAdjustedTime();
                      e.preventDefault();
                  }
              };
              timeContents.appendChild(collapsedBtn);
          }
          return;
      }

      // Expanded state: show adjusted time
      adjustedSpan = document.getElementById('yt-adjusted-time');
      let timeTextSpan, settingsBtn;
      const remaining = video ? video.duration - video.currentTime : 0;
      const adjusted = video ? remaining / video.playbackRate : 0;
      const boxColor = await getBoxColor();
      const textColor = await getTextColor();
      const showEndTime = await getShowEndTime();
      const use24Hour = await get24HourTime();
      const endTime = formatEndTime(adjusted, use24Hour);
      const newText = showEndTime ? `${formatTime(adjusted)} | ${endTime}` : `${formatTime(adjusted)}`;
      const globalSaved = await getGlobalTimeSaved();
      // Tooltip: show session and all-time saved
      const tooltip = `Session saved: ${formatTime(sessionTimeSaved)}\nAll-time saved: ${formatLongDuration(globalSaved)}`;
      // YouTube time style
      const ytFont = "'YouTube Sans', 'Roboto', 'Arial', 'sans-serif'";
      const ytFontSize = '13px';
      const ytFontWeight = '400';
      const ytBorderRadius = '2px';
      const ytPadding = '0 4px';
      const ytBorder = boxColor !== 'transparent' ? '1px solid rgba(0,0,0,0.15)' : 'none';
      const ytVerticalAlign = 'middle';
      if (adjustedSpan) {
          timeTextSpan = adjustedSpan.querySelector('.yt-adjusted-time-text');
          if (timeTextSpan) {
              timeTextSpan.textContent = newText;
          }
          adjustedSpan.style.background = boxColor;
          adjustedSpan.style.color = textColor;
          adjustedSpan.title = tooltip;
          adjustedSpan.setAttribute('aria-label', `Adjusted time left: ${formatTime(adjusted)}${showEndTime ? ', ends at ' + endTime : ''}. ${tooltip}`);
          // YouTube style
          adjustedSpan.style.fontFamily = ytFont;
          adjustedSpan.style.fontSize = ytFontSize;
          adjustedSpan.style.fontWeight = ytFontWeight;
          adjustedSpan.style.borderRadius = ytBorderRadius;
          adjustedSpan.style.padding = ytPadding;
          adjustedSpan.style.border = ytBorder;
          adjustedSpan.style.textShadow = 'none';
          adjustedSpan.style.boxShadow = 'none';
          adjustedSpan.style.verticalAlign = ytVerticalAlign;
      } else {
          // Remove old adjusted time if present (shouldn't be needed, but for safety)
          adjustedSpan = document.getElementById('yt-adjusted-time');
          if (adjustedSpan) adjustedSpan.remove();
          settingsBtn = document.getElementById('yt-adjusted-time-settings-btn');
          if (settingsBtn) settingsBtn.remove();
          let popup = document.getElementById('yt-adjusted-time-popup');
          if (popup) popup.remove();
          // Create new adjusted time span
          adjustedSpan = document.createElement('span');
          adjustedSpan.id = 'yt-adjusted-time';
          adjustedSpan.style.marginLeft = '6px';
          adjustedSpan.style.color = textColor;
          adjustedSpan.style.background = boxColor;
          // YouTube style
          adjustedSpan.style.fontFamily = ytFont;
          adjustedSpan.style.fontSize = ytFontSize;
          adjustedSpan.style.fontWeight = ytFontWeight;
          adjustedSpan.style.borderRadius = ytBorderRadius;
          adjustedSpan.style.padding = ytPadding;
          adjustedSpan.style.border = ytBorder;
          adjustedSpan.style.textShadow = 'none';
          adjustedSpan.style.boxShadow = 'none';
          adjustedSpan.style.verticalAlign = ytVerticalAlign;
          // Add time text span
          timeTextSpan = document.createElement('span');
          timeTextSpan.className = 'yt-adjusted-time-text';
          timeTextSpan.textContent = newText;
          adjustedSpan.appendChild(timeTextSpan);
          // Add settings button
          settingsBtn = document.createElement('button');
          settingsBtn.id = 'yt-adjusted-time-settings-btn';
          settingsBtn.textContent = '⚙️';
          settingsBtn.title = 'Settings';
          settingsBtn.style.marginLeft = '2px';
          settingsBtn.style.background = 'transparent';
          settingsBtn.style.border = 'none';
          settingsBtn.style.cursor = 'pointer';
          settingsBtn.style.verticalAlign = 'text-bottom';
          settingsBtn.style.transform = 'translateY(-2px)';
          settingsBtn.style.padding = '0';
          settingsBtn.style.height = '1em';
          settingsBtn.style.lineHeight = '1em';
          settingsBtn.style.fontSize = '90%';
          settingsBtn.setAttribute('aria-label', 'Open adjusted time settings');
          settingsBtn.onclick = async function(e) {
              e.stopPropagation();
              // Gather current settings for popup
              const boxColor = await getBoxColor();
              const textColor = await getTextColor();
              const showEndTime = await getShowEndTime();
              const globalSaved = await getGlobalTimeSaved();
              createSettingsPopup(document.body, boxColor, textColor, showEndTime, sessionTimeSaved, globalSaved);
          };
          adjustedSpan.appendChild(settingsBtn);
          // Collapse/expand event listeners
          adjustedSpan.onclick = function(e) {
              ytAdjustedTimeCollapsed = true;
              setCollapsedState(true);
              updateAdjustedTime();
              e.stopPropagation();
          };
          adjustedSpan.onkeydown = function(e) {
              if (e.key === 'Enter' || e.key === ' ') {
                  ytAdjustedTimeCollapsed = true;
                  setCollapsedState(true);
                  updateAdjustedTime();
                  e.preventDefault();
              }
          };
          timeContents.appendChild(adjustedSpan);
          // YouTube style
          adjustedSpan.style.fontFamily = ytFont;
          adjustedSpan.style.fontSize = ytFontSize;
          adjustedSpan.style.fontWeight = ytFontWeight;
          adjustedSpan.style.borderRadius = ytBorderRadius;
          adjustedSpan.style.padding = ytPadding;
          adjustedSpan.style.border = ytBorder;
          adjustedSpan.style.textShadow = 'none';
          adjustedSpan.style.boxShadow = 'none';
          adjustedSpan.style.verticalAlign = ytVerticalAlign;
      }
  }

  let timeDisplayObserver = null;
  function observeTimeDisplay() {
      let timeContents = document.querySelector('.ytp-time-contents');
      if (timeContents) {
          if (timeDisplayObserver) timeDisplayObserver.disconnect();
          timeDisplayObserver = new MutationObserver(() => {
              throttledUpdateAdjustedTime();
          });
          timeDisplayObserver.observe(timeContents, { childList: true, subtree: true });
      }
  }

  const observer = new MutationObserver(() => {
      throttledUpdateAdjustedTime();
      observeTimeDisplay();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('resize', throttledUpdateAdjustedTime);

  throttledUpdateAdjustedTime();

  // Listen for color changes in storage and update UI in real time
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.onChanged) {
      browser.storage.onChanged.addListener((changes, area) => {
          if (area === 'sync' && changes.ytAdjustedTimeBoxColor) {
              console.log('[YT Adjusted Time] Detected color change:', changes.ytAdjustedTimeBoxColor);
              updateAdjustedTime();
          }
      });
  } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
          if (area === 'sync' && changes.ytAdjustedTimeBoxColor) {
              console.log('[YT Adjusted Time] Detected color change:', changes.ytAdjustedTimeBoxColor);
              updateAdjustedTime();
          }
      });
  }

  console.log('[YT Adjusted Time] Script loaded - END');
  let sessionTimeSaved = 0;

  console.log('[YT Adjusted Time] Script loaded - END');

  // --- BEGIN: YouTube Watch Session Tracking for Statistics ---
  (function() {
      let currentSession = null;
      let videoElement = null;
      let sessionTimeout = null;

      function getVideoId() {
          const url = new URL(window.location.href);
          return url.searchParams.get('v');
      }

      function getVideoTitle() {
          const el = document.querySelector('h1.title, h1.ytd-watch-metadata');
          return el ? el.textContent.trim() : '';
      }

      function getChannelName() {
          const el = document.querySelector('ytd-channel-name a, ytd-channel-name yt-formatted-string');
          return el ? el.textContent.trim() : '';
      }

      function saveSession(session) {
          if (!session || !session.videoId || !session.startTime || !session.endTime) return;
          chrome.storage.local.get({ ytWatchStats: [] }, function(data) {
              const stats = data.ytWatchStats || [];
              stats.push(session);
              chrome.storage.local.set({ ytWatchStats: stats });
          });
      }

      function startSession() {
          const videoId = getVideoId();
          if (!videoId) return;
          if (currentSession && currentSession.videoId === videoId) return; // Already tracking
          endSession();
          currentSession = {
              videoId,
              title: getVideoTitle(),
              channel: getChannelName(),
              startTime: Date.now(),
              endTime: null
          };
      }

      function endSession() {
          if (currentSession && !currentSession.endTime) {
              currentSession.endTime = Date.now();
              // Only save if session lasted at least 5 seconds
              if (currentSession.endTime - currentSession.startTime > 5000) {
                  saveSession(currentSession);
              }
          }
          currentSession = null;
      }

      function onVideoPlay() {
          startSession();
          if (sessionTimeout) clearTimeout(sessionTimeout);
      }

      function onVideoPause() {
          if (sessionTimeout) clearTimeout(sessionTimeout);
          // Wait a bit before ending session in case of short pauses
          sessionTimeout = setTimeout(endSession, 15000);
      }

      function setupVideoTracking() {
          if (videoElement) {
              videoElement.removeEventListener('play', onVideoPlay);
              videoElement.removeEventListener('pause', onVideoPause);
          }
          videoElement = document.querySelector('video');
          if (videoElement) {
              videoElement.addEventListener('play', onVideoPlay);
              videoElement.addEventListener('pause', onVideoPause);
              if (!videoElement.paused) {
                  onVideoPlay();
              }
          }
      }

      // Detect navigation (YouTube uses SPA navigation)
      let lastUrl = location.href;
      new MutationObserver(() => {
          if (location.href !== lastUrl) {
              lastUrl = location.href;
              endSession();
              setTimeout(setupVideoTracking, 1000);
          }
      }).observe(document, { subtree: true, childList: true });

      // Initial setup
      window.addEventListener('yt-navigate-finish', () => {
          endSession();
          setTimeout(setupVideoTracking, 1000);
      });
      setTimeout(setupVideoTracking, 2000);
      window.addEventListener('beforeunload', endSession);
  })();
  // --- END: YouTube Watch Session Tracking for Statistics ---

})();
