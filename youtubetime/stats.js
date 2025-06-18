// stats.js

/**
 * Format a duration in seconds as h m s.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Formatted duration string.
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Format a long duration in years, months, days, hours, minutes.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Formatted long duration string.
 */
export function formatLongDuration(seconds) {
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

/**
 * Format the global time saved value.
 * @param {number} seconds - Time saved in seconds.
 * @returns {string} Formatted long duration string.
 */
export function formatGlobalTimeSaved(seconds) {
  return formatLongDuration(seconds);
}

/**
 * Format a duration in seconds as m:ss.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Formatted time string.
 */
export function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format the end time given seconds from now.
 * @param {number} secondsFromNow - Seconds from now to end.
 * @param {boolean} use24Hour - Whether to use 24-hour time format.
 * @returns {string} Formatted end time string.
 */
export function formatEndTime(secondsFromNow, use24Hour) {
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

function getDayKey(ts) {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getHour(ts) {
  return new Date(ts).getHours();
}

/**
 * Aggregate stats from an array of watch sessions.
 * @param {Array} sessions - Array of session objects with startTime, endTime, channel, and title.
 * @returns {Object} Aggregated stats object.
 */
export function aggregateStats(sessions) {
  const now = Date.now();
  const oneDay = 24 * 3600 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;
  let total = 0, totalDay = 0, totalWeek = 0, totalMonth = 0;
  let sessionLengths = [];
  let channelMap = {}, videoMap = {}, hourMap = {};
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