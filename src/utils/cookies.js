/**
 * Cookies utility for saving and retrieving user interface settings
 */

/**
 * Set a cookie with specified name and value
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration time in days
 */
export function setCookie(name, value, days = 30) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

/**
 * Get value of a cookie by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 */
export function deleteCookie(name) {
  setCookie(name, '', -1);
}

/**
 * Save project list column settings to cookies
 * @param {Object} columnSettings - Column visibility settings
 */
export function saveProjectListColumnSettings(columnSettings) {
  setCookie('projectListColumnSettings', JSON.stringify(columnSettings));
}

/**
 * Get project list column settings from cookies
 * @returns {Object|null} Column settings or null if not found
 */
export function getProjectListColumnSettings() {
  const settings = getCookie('projectListColumnSettings');
  return settings ? JSON.parse(settings) : null;
}

/**
 * Save project list filters to cookies
 * @param {Object} filters - Filter settings
 */
export function saveProjectListFilters(filters) {
  setCookie('projectListFilters', JSON.stringify(filters));
}

/**
 * Get project list filters from cookies
 * @returns {Object|null} Filter settings or null if not found
 */
export function getProjectListFilters() {
  const filters = getCookie('projectListFilters');
  return filters ? JSON.parse(filters) : null;
}

/**
 * Save project list sorting to cookies
 * @param {Object} sorting - Sorting settings
 */
export function saveProjectListSorting(sorting) {
  setCookie('projectListSorting', JSON.stringify(sorting));
}

/**
 * Get project list sorting from cookies
 * @returns {Object|null} Sorting settings or null if not found
 */
export function getProjectListSorting() {
  const sorting = getCookie('projectListSorting');
  return sorting ? JSON.parse(sorting) : null;
}

/**
 * Save Gantt chart view mode to cookies
 * @param {string} viewMode - View mode ('month' or 'week')
 */
export function saveGanttChartViewMode(viewMode) {
  setCookie('ganttChartViewMode', viewMode);
}

/**
 * Get Gantt chart view mode from cookies
 * @returns {string|null} View mode or null if not found
 */
export function getGanttChartViewMode() {
  return getCookie('ganttChartViewMode');
}

/**
 * Save Gantt chart date range to cookies
 * @param {Array} dateRange - Date range [startDate, endDate]
 */
export function saveGanttChartDateRange(dateRange) {
  setCookie('ganttChartDateRange', JSON.stringify(dateRange));
}

/**
 * Get Gantt chart date range from cookies
 * @returns {Array|null} Date range or null if not found
 */
export function getGanttChartDateRange() {
  const dateRange = getCookie('ganttChartDateRange');
  return dateRange ? JSON.parse(dateRange) : null;
}